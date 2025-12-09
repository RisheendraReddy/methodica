from config import Config
from models import db, Message, SearchIndex
import numpy as np

# Optional imports for vector search
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

class VectorSearchService:
    """Service for vector/semantic search"""
    
    def __init__(self):
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
            except Exception as e:
                print(f"Warning: Could not load embedding model: {e}")
                self.embedding_model = None
        else:
            self.embedding_model = None
            print("Warning: sentence-transformers not available. Vector search disabled.")
        self.provider = Config.VECTOR_SEARCH_PROVIDER
        
        if self.provider == 'pinecone':
            self._init_pinecone()
        elif self.provider == 'qdrant':
            self._init_qdrant()
        else:
            # Fallback to in-memory search
            self.use_in_memory = True
    
    def _init_pinecone(self):
        """Initialize Pinecone client"""
        try:
            import pinecone
            pinecone.init(
                api_key=Config.PINECONE_API_KEY,
                environment=Config.PINECONE_ENVIRONMENT
            )
            self.index = pinecone.Index(Config.PINECONE_INDEX_NAME)
            self.use_in_memory = False
        except Exception as e:
            print(f"Pinecone initialization failed: {e}, falling back to in-memory")
            self.use_in_memory = True
    
    def _init_qdrant(self):
        """Initialize Qdrant client"""
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.models import Distance, VectorParams
            
            self.qdrant_client = QdrantClient(
                url=Config.QDRANT_URL,
                api_key=Config.QDRANT_API_KEY if Config.QDRANT_API_KEY else None
            )
            
            # Create collection if it doesn't exist
            try:
                self.qdrant_client.get_collection(Config.PINECONE_INDEX_NAME)
            except:
                self.qdrant_client.create_collection(
                    collection_name=Config.PINECONE_INDEX_NAME,
                    vectors_config=VectorParams(
                        size=384,  # all-MiniLM-L6-v2 dimension
                        distance=Distance.COSINE
                    )
                )
            
            self.use_in_memory = False
        except Exception as e:
            print(f"Qdrant initialization failed: {e}, falling back to in-memory")
            self.use_in_memory = True
    
    def index_message(self, message_id: int, content: str, user_id: str):
        """Index a message for search"""
        if not self.embedding_model:
            return  # Vector search not available
        embedding = self.embedding_model.encode(content).tolist()
        
        if self.provider == 'pinecone' and not self.use_in_memory:
            self.index.upsert([(str(message_id), embedding)])
        elif self.provider == 'qdrant' and not self.use_in_memory:
            self.qdrant_client.upsert(
                collection_name=Config.PINECONE_INDEX_NAME,
                points=[{
                    'id': message_id,
                    'vector': embedding,
                    'payload': {'user_id': user_id}
                }]
            )
        else:
            # Store in database
            message = Message.query.get(message_id)
            if message:
                message.embedding = embedding
                db.session.commit()
    
    def search(self, user_id: str, query: str, limit: int = 10):
        """Search for similar messages"""
        if not self.embedding_model:
            return []  # Vector search not available
        query_embedding = self.embedding_model.encode(query).tolist()
        
        if self.provider == 'pinecone' and not self.use_in_memory:
            results = self.index.query(
                vector=query_embedding,
                top_k=limit,
                include_metadata=True
            )
            return [
                {
                    'message_id': int(match.id),
                    'score': match.score
                }
                for match in results.matches
            ]
        
        elif self.provider == 'qdrant' and not self.use_in_memory:
            results = self.qdrant_client.search(
                collection_name=Config.PINECONE_INDEX_NAME,
                query_vector=query_embedding,
                limit=limit,
                query_filter={
                    'must': [{'key': 'user_id', 'match': {'value': user_id}}]
                }
            )
            return [
                {
                    'message_id': result.id,
                    'score': result.score
                }
                for result in results
            ]
        
        else:
            # In-memory search using database embeddings
            messages = Message.query.join(Message.conversation).filter(
                Message.embedding.isnot(None)
            ).all()
            
            if not messages:
                return []
            
            # Calculate cosine similarity
            query_vec = np.array(query_embedding)
            results = []
            
            for msg in messages:
                if msg.embedding:
                    msg_vec = np.array(msg.embedding)
                    similarity = np.dot(query_vec, msg_vec) / (
                        np.linalg.norm(query_vec) * np.linalg.norm(msg_vec)
                    )
                    results.append({
                        'message_id': msg.id,
                        'score': float(similarity)
                    })
            
            # Sort by score and return top results
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:limit]

