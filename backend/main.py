# fastapi, pydantic, sqlalchemy, passlib, python-jose
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# ----------------- SECURITY CONFIG -----------------
SECRET_KEY = "super-secret-key-for-development-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ----------------- DATABASE CONFIG -----------------
SQLALCHEMY_DATABASE_URL = "sqlite:///./enterprise.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------- DATA SCHEMA (SQLAlchemy Models) -----------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # Admin, Sales, Warehouse
    full_name = Column(String)
    shifts = relationship("Shift", back_populates="user")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    stock_quantity = Column(Integer, default=0)
    price = Column(Float)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    total_amount = Column(Float)
    payment_method = Column(String) # Cash, Transfer
    status = Column(String, default="Completed")
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer)
    order = relationship("Order", back_populates="items")
    item = relationship("Item")

class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    user = relationship("User", back_populates="shifts")

Base.metadata.create_all(bind=engine)

# ----------------- PYDANTIC SCHEMAS -----------------
class Token(BaseModel):
    access_token: string
    token_type: string

class TokenData(BaseModel):
    username: Optional[str] = None

class ItemCreate(BaseModel):
    sku: str
    name: str
    stock_quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    payment_method: str
    item_ids_quantities: dict[int, int] # item_id -> quantity

# ----------------- APP DEFINITION -----------------
app = FastAPI(title="Enterprise API Dashboard", description="API for Inventory, Sales, HR")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------- auth & SECURITY LOGIC -----------------
def get_user(db, username: str):
    return db.query(User).filter(User.username == username).first()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# ----------------- INVENTORY LOGIC -----------------
@app.get("/items", tags=["Inventory"])
def get_items(db = Depends(get_db), current_user: User = Depends(get_current_user)):
    items = db.query(Item).all()
    # Check for low stock logic (alerting via return or external service)
    low_stock = [item for item in items if item.stock_quantity < 5]
    if low_stock:
        print(f"ALERT: {len(low_stock)} items are under 5 units.")
    return items

@app.post("/items", tags=["Inventory"])
def create_item(item: ItemCreate, db = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_item = Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# ----------------- SALES LOGIC -----------------
@app.post("/orders", tags=["Sales"])
def create_order(order: OrderCreate, db = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_amount = 0
    # Create order first
    db_order = Order(
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        payment_method=order.payment_method,
        total_amount=0 # Update later
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item_id, quantity in order.item_ids_quantities.items():
        db_item = db.query(Item).filter(Item.id == item_id).first()
        if not db_item or db_item.stock_quantity < quantity:
            raise HTTPException(status_code=400, detail=f"Item {item_id} out of stock")
        
        # Deduct stock
        db_item.stock_quantity -= quantity
        total_amount += (db_item.price * quantity)
        
        # Create order item
        order_item = OrderItem(order_id=db_order.id, item_id=item_id, quantity=quantity)
        db.add(order_item)
        
    db_order.total_amount = total_amount
    db.commit()
    return db_order

# ----------------- HR LOGIC -----------------
@app.post("/hr/clock_in", tags=["HR"])
def clock_in(db = Depends(get_db), current_user: User = Depends(get_current_user)):
    shift = Shift(user_id=current_user.id, start_time=datetime.utcnow())
    db.add(shift)
    db.commit()
    return {"message": "Clocked in"}
