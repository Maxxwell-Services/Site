from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from passlib.context import CryptContext
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import base64
import re
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    return payload

# Models
class TechnicianRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class TechnicianLogin(BaseModel):
    email: EmailStr
    password: str

class Technician(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomerRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class CustomerLogin(BaseModel):
    email: EmailStr
    password: str

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    report_ids: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MaintenanceReportCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    # Evaporator Coil Details
    evaporator_brand: str
    evaporator_model_number: str
    evaporator_serial_number: str
    evaporator_date_of_manufacture: Optional[str] = ""
    evaporator_age: Optional[str] = ""
    evaporator_warranty_status: str
    evaporator_warranty_details: Optional[str] = ""
    evaporator_photos: Optional[List[str]] = Field(default_factory=list)  # Base64 encoded images
    # Condenser Details
    condenser_brand: str
    condenser_model_number: str
    condenser_serial_number: str
    condenser_date_of_manufacture: Optional[str] = ""
    condenser_age: Optional[str] = ""
    condenser_warranty_status: str
    condenser_warranty_details: Optional[str] = ""
    condenser_photos: Optional[List[str]] = Field(default_factory=list)  # Base64 encoded images
    condenser_fan_motor: str = "Normal Operation"  # "Normal Operation", "Motor Vibration", "Blade Vibration", "Inoperative"
    refrigerant_type: str
    superheat: float  # in Fahrenheit
    subcooling: float  # in Fahrenheit
    refrigerant_status: str  # "Good", "Low - Add Refrigerant", "Critical - Repairs may be needed"
    refrigerant_photos: Optional[List[str]] = Field(default_factory=list)
    blower_motor_type: str = "PSC Motor"  # "PSC Motor" or "ECM Motor"
    blower_motor_capacitor_rating: Optional[float] = None  # in microfarads, required for PSC Motor only
    blower_motor_capacitor_reading: Optional[float] = None  # in microfarads, required for PSC Motor only
    condenser_capacitor_rating: float  # in microfarads
    condenser_capacitor_reading: float  # in microfarads
    capacitor_photos: Optional[List[str]] = Field(default_factory=list)
    return_temp: float  # in Fahrenheit
    supply_temp: float  # in Fahrenheit
    temperature_photos: Optional[List[str]] = Field(default_factory=list)
    amp_draw: float
    rated_amps: float
    electrical_photos: Optional[List[str]] = Field(default_factory=list)
    primary_drain: str
    primary_drain_notes: Optional[str] = ""
    drain_pan_condition: str
    drainage_photos: Optional[List[str]] = Field(default_factory=list)
    air_filters: str
    evaporator_coil: str
    condenser_coils: str
    # Indoor Air Quality
    air_purifier: str
    plenums: str
    ductwork: str
    indoor_air_quality_photos: Optional[List[str]] = Field(default_factory=list)
    general_photos: Optional[List[str]] = Field(default_factory=list)  # General system photos
    notes: Optional[str] = None
    other_repair_recommendations: Optional[str] = None

class MaintenanceReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    unique_link: str = Field(default_factory=lambda: str(uuid.uuid4()))
    technician_id: str
    technician_name: str
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    # Evaporator Coil Details
    evaporator_brand: str
    evaporator_model_number: str
    evaporator_serial_number: str
    evaporator_date_of_manufacture: Optional[str] = ""
    evaporator_age: Optional[str] = ""
    evaporator_warranty_status: str
    evaporator_warranty_details: Optional[str] = ""
    evaporator_photos: Optional[List[str]] = Field(default_factory=list)
    # Condenser Details
    condenser_brand: str
    condenser_model_number: str
    condenser_serial_number: str
    condenser_age: Optional[int] = None
    condenser_warranty_status: str
    condenser_warranty_details: Optional[str] = ""
    condenser_photos: Optional[List[str]] = Field(default_factory=list)
    condenser_fan_motor: str
    refrigerant_type: str
    superheat: float
    subcooling: float
    refrigerant_status: str
    refrigerant_photos: Optional[List[str]] = Field(default_factory=list)
    blower_motor_type: str
    blower_motor_capacitor_rating: Optional[float] = None
    blower_motor_capacitor_reading: Optional[float] = None
    blower_motor_capacitor_health: Optional[str] = None  # "Good", "Warning", "Critical" (only for PSC Motor)
    blower_motor_capacitor_tolerance: Optional[float] = None  # percentage difference (only for PSC Motor)
    condenser_capacitor_rating: float
    condenser_capacitor_reading: float
    condenser_capacitor_health: str  # "Good", "Warning", "Critical"
    condenser_capacitor_tolerance: float  # percentage difference
    capacitor_photos: Optional[List[str]] = Field(default_factory=list)
    return_temp: float
    supply_temp: float
    delta_t: float
    delta_t_status: str  # "Good", "Warning", "Critical"
    temperature_photos: Optional[List[str]] = Field(default_factory=list)
    amp_draw: float
    rated_amps: float
    amp_status: str  # "Good", "Warning", "Critical"
    electrical_photos: Optional[List[str]] = Field(default_factory=list)
    primary_drain: str
    primary_drain_notes: Optional[str] = ""
    drain_pan_condition: str
    drainage_photos: Optional[List[str]] = Field(default_factory=list)
    air_filters: str
    evaporator_coil: str
    condenser_coils: str
    # Indoor Air Quality
    air_purifier: str
    plenums: str
    ductwork: str
    indoor_air_quality_photos: Optional[List[str]] = Field(default_factory=list)
    general_photos: Optional[List[str]] = Field(default_factory=list)
    notes: Optional[str] = None
    other_repair_recommendations: Optional[str] = None
    warnings: List[dict] = Field(default_factory=list)
    performance_score: int = 100
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Part(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    description: str
    price: float
    image_url: Optional[str] = None

# Helper function to calculate system age from serial number
def calculate_system_age(serial_number: str) -> Optional[int]:
    # Simple logic: assume first 4 digits or letters indicate year
    # This is a simplified version - real implementation would vary by manufacturer
    try:
        year_code = serial_number[:4]
        if year_code.isdigit():
            year = int(year_code)
            if 1990 <= year <= datetime.now().year:
                return datetime.now().year - year
    except:
        pass
    return None

# Tolerance checking functions
def check_capacitor_tolerance(rating: float, reading: float) -> tuple[str, float, bool]:
    tolerance = abs(rating - reading) / rating * 100
    needs_replacement = False
    
    if tolerance <= 6:
        status = "Good"
    elif tolerance <= 10:
        status = "Warning"
        needs_replacement = True
    else:
        status = "Critical"
        needs_replacement = True
    
    return status, tolerance, needs_replacement

def check_delta_t(delta: float) -> str:
    # Delta T thresholds:
    # 15°F to 24°F = Normal (Good)
    # 10°F to 14°F = Yellow warning (Warning)
    # Below 10°F = Red warning (Critical)
    if 15 <= delta <= 24:
        return "Good"
    elif 10 <= delta < 15:
        return "Warning"
    else:
        return "Critical"

def check_amp_draw(actual: float, rated: float) -> str:
    tolerance = abs(actual - rated) / rated * 100
    if tolerance <= 10:
        return "Good"
    elif tolerance <= 20:
        return "Warning"
    else:
        return "Critical"

def calculate_performance_score(data) -> int:
    """Calculate overall system performance score (0-100)"""
    score = 100
    
    # Capacitor health impact (max -40 points)
    cap_tolerance = data.get('capacitor_tolerance', 0)
    if cap_tolerance > 20:
        score -= 40  # Critical - extremely low readings
    elif cap_tolerance > 15:
        score -= 30  # Very bad
    elif cap_tolerance > 10:
        score -= 20  # Bad - needs replacement
    elif cap_tolerance > 6:
        score -= 10  # Minor issue
    
    # Delta T impact (max -25 points)
    delta_t = data.get('delta_t', 18)
    if delta_t < 10 or delta_t > 28:
        score -= 25  # Critical
    elif delta_t < 12 or delta_t > 25:
        score -= 15  # Warning
    elif delta_t < 15 or delta_t > 22:
        score -= 8   # Minor issue
    
    # Amp draw impact (max -20 points)
    amp_tolerance = abs(data.get('amp_draw', 0) - data.get('rated_amps', 0)) / data.get('rated_amps', 1) * 100
    if amp_tolerance > 25:
        score -= 20  # Critical
    elif amp_tolerance > 15:
        score -= 12  # Warning
    elif amp_tolerance > 10:
        score -= 6   # Minor
    
    # Refrigerant status impact (max -20 points)
    ref_status = data.get('refrigerant_status', 'Good')
    if ref_status == 'Critical':
        score -= 20
    elif ref_status == 'Low':
        score -= 10
    
    # Primary drain impact (max -15 points)
    if data.get('primary_drain') == 'Clogged, needs immediate service':
        score -= 15
    
    # Drain pan condition impact (max -15 points)
    drain_pan = data.get('drain_pan_condition', 'Good shape')
    if drain_pan == 'Rusted and should be replaced':
        score -= 15
    elif drain_pan == 'Poor condition':
        score -= 10
    elif drain_pan == 'Fair condition':
        score -= 5
    
    # Air purifier impact (max -10 points)
    air_purifier = data.get('air_purifier', 'Good')
    if air_purifier == 'Air purifier needs replacement':
        score -= 10
    elif air_purifier == 'UV light needs replacement':
        score -= 5
    
    # System age impact (max -10 points bonus for newer systems)
    system_age = data.get('system_age', 0)
    if system_age > 15:
        score -= 10
    elif system_age > 12:
        score -= 5
    
    return max(0, min(100, score))

# Routes
@api_router.post("/auth/technician/register")
async def register_technician(data: TechnicianRegister):
    # Check if email already exists
    existing = await db.technicians.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create technician
    technician = Technician(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    
    await db.technicians.insert_one(technician.model_dump())
    
    token = create_access_token({"sub": technician.id, "email": technician.email, "type": "technician"})
    
    return {
        "token": token,
        "user": {
            "id": technician.id,
            "username": technician.username,
            "email": technician.email
        }
    }

@api_router.post("/auth/technician/login")
async def login_technician(data: TechnicianLogin):
    technician = await db.technicians.find_one({"email": data.email})
    if not technician or not verify_password(data.password, technician["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": technician["id"], "email": technician["email"], "type": "technician"})
    
    return {
        "token": token,
        "user": {
            "id": technician["id"],
            "username": technician["username"],
            "email": technician["email"]
        }
    }

@api_router.post("/auth/customer/register")
async def register_customer(data: CustomerRegister):
    existing = await db.customers.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    customer = Customer(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    
    await db.customers.insert_one(customer.model_dump())
    
    token = create_access_token({"sub": customer.id, "email": customer.email, "type": "customer"})
    
    return {
        "token": token,
        "user": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email
        }
    }

@api_router.post("/auth/customer/login")
async def login_customer(data: CustomerLogin):
    customer = await db.customers.find_one({"email": data.email})
    if not customer or not verify_password(data.password, customer["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": customer["id"], "email": customer["email"], "type": "customer"})
    
    return {
        "token": token,
        "user": {
            "id": customer["id"],
            "name": customer["name"],
            "email": customer["email"]
        }
    }

@api_router.post("/reports/create")
async def create_report(data: MaintenanceReportCreate, user: dict = Depends(get_current_user)):
    if user.get("type") != "technician":
        raise HTTPException(status_code=403, detail="Only technicians can create reports")
    
    # Get technician info
    technician = await db.technicians.find_one({"id": user["sub"]})
    if not technician:
        raise HTTPException(status_code=404, detail="Technician not found")
    
    # Calculate derived values
    delta_t = data.return_temp - data.supply_temp
    
    # Check tolerances for capacitors
    # Blower motor capacitor - only check if PSC Motor
    if data.blower_motor_type == "PSC Motor" and data.blower_motor_capacitor_rating and data.blower_motor_capacitor_reading:
        blower_capacitor_status, blower_capacitor_tolerance, blower_capacitor_needs_replacement = check_capacitor_tolerance(
            data.blower_motor_capacitor_rating, data.blower_motor_capacitor_reading
        )
    else:
        # ECM Motor - no capacitor needed
        blower_capacitor_status = "N/A"
        blower_capacitor_tolerance = 0.0
        blower_capacitor_needs_replacement = False
    
    condenser_capacitor_status, condenser_capacitor_tolerance, condenser_capacitor_needs_replacement = check_capacitor_tolerance(
        data.condenser_capacitor_rating, data.condenser_capacitor_reading
    )
    delta_t_status = check_delta_t(delta_t)
    amp_status = check_amp_draw(data.amp_draw, data.rated_amps)
    
    # Build warnings list
    warnings = []
    if blower_capacitor_needs_replacement:
        warnings.append({
            "type": "blower_capacitor",
            "severity": blower_capacitor_status.lower(),
            "message": f"Blower motor capacitor reading is {blower_capacitor_tolerance:.1f}% off from rated value",
            "part_needed": "capacitor"
        })
    
    if condenser_capacitor_needs_replacement:
        warnings.append({
            "type": "condenser_capacitor",
            "severity": condenser_capacitor_status.lower(),
            "message": f"Condenser capacitor reading is {condenser_capacitor_tolerance:.1f}% off from rated value",
            "part_needed": "capacitor"
        })
    
    if delta_t_status != "Good":
        warnings.append({
            "type": "delta_t",
            "severity": delta_t_status.lower(),
            "message": f"Delta T is {delta_t:.1f}°F (ideal range: 15-22°F)",
            "part_needed": None
        })
    
    if amp_status != "Good":
        warnings.append({
            "type": "amp_draw",
            "severity": amp_status.lower(),
            "message": f"Amp draw is outside normal range (actual: {data.amp_draw}A, rated: {data.rated_amps}A)",
            "part_needed": None
        })
    
    if data.refrigerant_status != "Good":
        warnings.append({
            "type": "refrigerant",
            "severity": "warning" if "Low" in data.refrigerant_status else "critical",
            "message": f"Refrigerant status: {data.refrigerant_status}",
            "part_needed": "refrigerant"
        })
    
    # Calculate performance score (use worst capacitor tolerance)
    worst_capacitor_tolerance = max(blower_capacitor_tolerance, condenser_capacitor_tolerance)
    score_data = {
        'capacitor_tolerance': worst_capacitor_tolerance,
        'delta_t': delta_t,
        'amp_draw': data.amp_draw,
        'rated_amps': data.rated_amps,
        'refrigerant_status': data.refrigerant_status,
        'primary_drain': data.primary_drain,
        'drain_pan_condition': data.drain_pan_condition,
        'air_purifier': data.air_purifier,
        'system_age': data.evaporator_age or data.condenser_age  # Use component age instead
    }
    performance_score = calculate_performance_score(score_data)
    
    # Create report
    report = MaintenanceReport(
        technician_id=technician["id"],
        technician_name=technician["username"],
        customer_name=data.customer_name,
        customer_email=data.customer_email,
        customer_phone=data.customer_phone,
        evaporator_brand=data.evaporator_brand,
        evaporator_model_number=data.evaporator_model_number,
        evaporator_serial_number=data.evaporator_serial_number,
        evaporator_age=data.evaporator_age,
        evaporator_warranty_status=data.evaporator_warranty_status,
        evaporator_warranty_details=data.evaporator_warranty_details or "",
        evaporator_photos=data.evaporator_photos or [],
        condenser_brand=data.condenser_brand,
        condenser_model_number=data.condenser_model_number,
        condenser_serial_number=data.condenser_serial_number,
        condenser_age=data.condenser_age,
        condenser_warranty_status=data.condenser_warranty_status,
        condenser_warranty_details=data.condenser_warranty_details or "",
        condenser_photos=data.condenser_photos or [],
        condenser_fan_motor=data.condenser_fan_motor,
        refrigerant_type=data.refrigerant_type,
        superheat=data.superheat,
        subcooling=data.subcooling,
        refrigerant_status=data.refrigerant_status,
        refrigerant_photos=data.refrigerant_photos or [],
        blower_motor_type=data.blower_motor_type,
        blower_motor_capacitor_rating=data.blower_motor_capacitor_rating,
        blower_motor_capacitor_reading=data.blower_motor_capacitor_reading,
        blower_motor_capacitor_health=blower_capacitor_status if data.blower_motor_type == "PSC Motor" else None,
        blower_motor_capacitor_tolerance=blower_capacitor_tolerance if data.blower_motor_type == "PSC Motor" else None,
        condenser_capacitor_rating=data.condenser_capacitor_rating,
        condenser_capacitor_reading=data.condenser_capacitor_reading,
        condenser_capacitor_health=condenser_capacitor_status,
        condenser_capacitor_tolerance=condenser_capacitor_tolerance,
        capacitor_photos=data.capacitor_photos or [],
        return_temp=data.return_temp,
        supply_temp=data.supply_temp,
        delta_t=delta_t,
        delta_t_status=delta_t_status,
        temperature_photos=data.temperature_photos or [],
        amp_draw=data.amp_draw,
        rated_amps=data.rated_amps,
        amp_status=amp_status,
        electrical_photos=data.electrical_photos or [],
        primary_drain=data.primary_drain,
        primary_drain_notes=data.primary_drain_notes,
        drain_pan_condition=data.drain_pan_condition,
        drainage_photos=data.drainage_photos or [],
        air_filters=data.air_filters,
        evaporator_coil=data.evaporator_coil,
        condenser_coils=data.condenser_coils,
        air_purifier=data.air_purifier,
        plenums=data.plenums,
        ductwork=data.ductwork,
        indoor_air_quality_photos=data.indoor_air_quality_photos or [],
        general_photos=data.general_photos or [],
        notes=data.notes,
        other_repair_recommendations=data.other_repair_recommendations,
        warnings=warnings,
        performance_score=performance_score
    )
    
    await db.reports.insert_one(report.model_dump())
    
    return {
        "report_id": report.id,
        "unique_link": report.unique_link,
        "message": "Report created successfully"
    }

@api_router.get("/reports/{unique_link}")
async def get_report_by_link(unique_link: str):
    report = await db.reports.find_one({"unique_link": unique_link}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@api_router.get("/reports")
async def get_technician_reports(user: dict = Depends(get_current_user)):
    if user.get("type") != "technician":
        raise HTTPException(status_code=403, detail="Access denied")
    
    reports = await db.reports.find(
        {"technician_id": user["sub"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return reports

@api_router.post("/customer/add-report/{unique_link}")
async def add_report_to_customer(unique_link: str, user: dict = Depends(get_current_user)):
    if user.get("type") != "customer":
        raise HTTPException(status_code=403, detail="Access denied")
    
    report = await db.reports.find_one({"unique_link": unique_link})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Add report to customer's history
    await db.customers.update_one(
        {"id": user["sub"]},
        {"$addToSet": {"report_ids": report["id"]}}
    )
    
    return {"message": "Report added to your history"}

@api_router.get("/customer/reports")
async def get_customer_reports(user: dict = Depends(get_current_user)):
    if user.get("type") != "customer":
        raise HTTPException(status_code=403, detail="Access denied")
    
    customer = await db.customers.find_one({"id": user["sub"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    reports = await db.reports.find(
        {"id": {"$in": customer.get("report_ids", [])}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    
    return reports

@api_router.get("/parts")
async def get_parts_catalog():
    parts = [
        {
            "id": "cap-20-440",
            "name": "Run Capacitor 20µF 440V",
            "category": "capacitor",
            "description": "Dual run capacitor for residential AC units",
            "price": 24.99,
            "image_url": "/images/capacitor.jpg"
        },
        {
            "id": "cap-35-440",
            "name": "Run Capacitor 35µF 440V",
            "category": "capacitor",
            "description": "Heavy-duty capacitor for larger AC systems",
            "price": 29.99,
            "image_url": "/images/capacitor.jpg"
        },
        {
            "id": "cap-45-440",
            "name": "Run Capacitor 45µF 440V",
            "category": "capacitor",
            "description": "High-capacity run capacitor",
            "price": 34.99,
            "image_url": "/images/capacitor.jpg"
        },
        {
            "id": "ref-r410a",
            "name": "R-410A Refrigerant 25lb Cylinder",
            "category": "refrigerant",
            "description": "Puron refrigerant for modern AC systems",
            "price": 189.99,
            "image_url": "/images/refrigerant.jpg"
        },
        {
            "id": "ref-r22",
            "name": "R-22 Refrigerant 30lb Cylinder",
            "category": "refrigerant",
            "description": "Freon for older AC systems",
            "price": 499.99,
            "image_url": "/images/refrigerant.jpg"
        },
        {
            "id": "filter-16x25",
            "name": "MERV 11 Air Filter 16x25x1",
            "category": "filter",
            "description": "High-efficiency pleated air filter",
            "price": 12.99,
            "image_url": "/images/filter.jpg"
        },
        {
            "id": "filter-20x25",
            "name": "MERV 11 Air Filter 20x25x1",
            "category": "filter",
            "description": "High-efficiency pleated air filter",
            "price": 14.99,
            "image_url": "/images/filter.jpg"
        },
        {
            "id": "coil-cleaner",
            "name": "Professional Coil Cleaner Concentrate",
            "category": "maintenance",
            "description": "Heavy-duty coil cleaning solution",
            "price": 24.99,
            "image_url": "/images/cleaner.jpg"
        },
        {
            "id": "contactor-30a",
            "name": "30A Contactor Relay",
            "category": "electrical",
            "description": "Single pole contactor for AC units",
            "price": 19.99,
            "image_url": "/images/contactor.jpg"
        },
        {
            "id": "thermostat-wifi",
            "name": "Smart WiFi Thermostat",
            "category": "control",
            "description": "Programmable smart thermostat with app control",
            "price": 149.99,
            "image_url": "/images/thermostat.jpg"
        }
    ]
    return parts

@api_router.get("/")
async def root():
    return {"message": "AC Maintenance Report API"}

# OCR Data Plate Scanning
class DataPlateOCRRequest(BaseModel):
    image_base64: str
    equipment_type: str  # "evaporator" or "condenser"

class DataPlateOCRResponse(BaseModel):
    brand: str
    model_number: str
    serial_number: str
    date_of_manufacture: Optional[str] = None
    estimated_age: Optional[str] = None
    warranty_status: Optional[str] = None

class WarrantyOCRRequest(BaseModel):
    image_base64: str
    brand: str
    serial_number: str

class WarrantyOCRResponse(BaseModel):
    age: Optional[str] = None
    warranty_status: str
    warranty_details: str

@api_router.post("/ocr/scan-warranty", response_model=WarrantyOCRResponse)
async def scan_warranty(request: WarrantyOCRRequest):
    """
    Extract warranty information from manufacturer warranty lookup screenshot using AI Vision
    """
    try:
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Initialize LLM Chat with OpenAI Vision
        chat = LlmChat(
            api_key=api_key,
            session_id=f"warranty-ocr-{uuid.uuid4()}",
            system_message="You are an expert at reading HVAC equipment warranty information from manufacturer websites and extracting detailed coverage information."
        ).with_model("openai", "gpt-4o")
        
        # Create image content
        image_content = ImageContent(image_base64=request.image_base64)
        
        # Create user message with specific instructions
        user_message = UserMessage(
            text=f"""Analyze this warranty lookup screenshot from {request.brand} for serial number {request.serial_number}.

Extract the following warranty information:

1. Equipment Age - Look for:
   - Manufacture date (e.g., "Manufactured: 05/2015" or "Date of Manufacture: 2015")
   - Age in years (e.g., "9 years old")
   - Installation date if shown
   - Any date reference that indicates when unit was made
   
2. Warranty Status - Determine if warranty is:
   - Active with specific years remaining (e.g., "Active (2 years remaining)")
   - Expired
   - Calculate remaining years if expiration date is shown
   
3. Detailed Coverage Information including:
   - Compressor warranty period and expiration
   - Heat exchanger warranty period
   - Parts coverage period and expiration
   - Labor coverage period (if any) and expiration
   - Extended warranty information
   - Specific expiration dates
   - Registration status
   - Any special conditions or notes

IMPORTANT:
- If you see a manufacture date or year, calculate the age: Current year (2024) - Manufacture year = Age
- If you see warranty expiration dates, calculate years remaining
- Be specific about coverage periods (e.g., "10 years", "20 years")
- Include actual dates when visible

Please respond ONLY with a JSON object in this exact format (no additional text):
{{
    "age": "X years (Manufactured YYYY)" or "Manufactured: MM/YYYY" or "X years old",
    "warranty_status": "Active (X years remaining on parts)" or "Expired" or specific status with years,
    "warranty_details": "Detailed breakdown: Compressor: X-year warranty, expires YYYY. Heat Exchanger: X-year warranty. Parts: X-year coverage, expires YYYY. Labor: [included/not included]. Extended warranty: [yes/no/details]. Special conditions: [any notes]"
}}

If age or dates are not visible in the screenshot, use "Not shown" for age.
Be thorough and extract ALL details visible.""",
            file_contents=[image_content]
        )
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Log the raw response for debugging
        logging.info(f"Warranty OCR Raw Response: {response}")
        
        # Parse the JSON response
        try:
            # Clean the response - remove markdown code blocks if present
            clean_response = response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            logging.info(f"Warranty OCR Cleaned Response: {clean_response}")
            data = json.loads(clean_response)
        except json.JSONDecodeError as e:
            logging.error(f"JSON Parse Error: {str(e)}, Response: {response}")
            # Try to extract JSON using regex if direct parsing fails
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                except json.JSONDecodeError:
                    logging.error(f"Regex extraction also failed. Full response: {response}")
                    raise HTTPException(status_code=500, detail=f"Failed to parse warranty OCR response")
            else:
                logging.error(f"No JSON found in response: {response}")
                raise HTTPException(status_code=500, detail=f"No valid JSON in warranty OCR response")
        
        return WarrantyOCRResponse(
            age=data.get("age"),
            warranty_status=data.get("warranty_status", "Unknown"),
            warranty_details=data.get("warranty_details", "Not found")
        )
        
    except Exception as e:
        logging.error(f"Warranty OCR Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Warranty OCR processing failed: {str(e)}")

@api_router.post("/ocr/scan-data-plate", response_model=DataPlateOCRResponse)
async def scan_data_plate(request: DataPlateOCRRequest):
    """
    Extract HVAC equipment information from data plate photo using AI Vision
    """
    try:
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Initialize LLM Chat with OpenAI Vision
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ocr-{uuid.uuid4()}",
            system_message="You are an expert at reading HVAC equipment data plates and extracting information accurately."
        ).with_model("openai", "gpt-4o")
        
        # Create image content
        image_content = ImageContent(image_base64=request.image_base64)
        
        # Create user message with specific instructions
        user_message = UserMessage(
            text=f"""Analyze this HVAC {request.equipment_type} data plate photo and extract the following information:

1. Brand/Manufacturer name - Look for company logos or names like "LENNOX", "TRANE", "CARRIER", "GOODMAN", etc.
2. Model Number - May be labeled as "MODEL", "MODEL NO.", "M/N", "MODEL #", or just appear as a product code
3. Serial Number - May be labeled as "SERIAL", "SERIAL NO.", "S/N", "SERIAL #", or appear as a unique identifier

IMPORTANT NOTES:
- Data plates may use abbreviations: "M/N" = Model Number, "S/N" = Serial Number
- Model numbers often contain letters and numbers (e.g., "CBA25UH-048-230-02")
- Serial numbers are typically numeric or alphanumeric codes (e.g., "1523C65202")
- Look carefully at all text on the data plate, even if it's in small print
- The model number is often one of the most prominent codes on the plate

Please respond ONLY with a JSON object in this exact format (no additional text):
{{
    "brand": "manufacturer name",
    "model_number": "model number",
    "serial_number": "serial number"
}}

If you cannot read a field clearly, use "Not found" as the value.
Read ALL text carefully and extract the exact values as they appear on the data plate.""",
            file_contents=[image_content]
        )
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        # Log the raw response for debugging
        logging.info(f"OCR Raw Response: {response}")
        
        # Parse the JSON response
        try:
            # Clean the response - remove markdown code blocks if present
            clean_response = response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            logging.info(f"OCR Cleaned Response: {clean_response}")
            data = json.loads(clean_response)
        except json.JSONDecodeError as e:
            logging.error(f"JSON Parse Error: {str(e)}, Response: {response}")
            # Try to extract JSON using regex if direct parsing fails
            json_match = re.search(r'\{[^}]+\}', response, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                except json.JSONDecodeError:
                    logging.error(f"Regex extraction also failed. Full response: {response}")
                    raise HTTPException(status_code=500, detail=f"Failed to parse OCR response. The AI returned: {response[:200]}")
            else:
                logging.error(f"No JSON found in response: {response}")
                raise HTTPException(status_code=500, detail=f"No valid JSON in OCR response. The AI returned: {response[:200]}")
        
        # Manufacturer-specific serial number parsing
        def parse_lennox_serial(serial):
            """
            Lennox format:
            - Positions 3-4: Year (e.g., 23 = 2023)
            - Position 5: Month letter (A=Jan, B=Feb, C=Mar, etc.)
            """
            if len(serial) >= 5:
                try:
                    year_code = int(serial[2:4])  # Positions 3-4 (0-indexed: [2:4])
                    month_letter = serial[4].upper()  # Position 5 (0-indexed: [4])
                    
                    # Convert 2-digit year to 4-digit
                    if year_code <= 30:
                        year = 2000 + year_code
                    else:
                        year = 1900 + year_code
                    
                    # Month mapping (note: no 'I' in the sequence)
                    month_map = {
                        'A': 'January', 'B': 'February', 'C': 'March', 'D': 'April',
                        'E': 'May', 'F': 'June', 'G': 'July', 'H': 'August',
                        'J': 'September', 'K': 'October', 'L': 'November', 'M': 'December'
                    }
                    month_name = month_map.get(month_letter, 'Unknown')
                    
                    return year, f"{month_name} {year}"
                except (ValueError, IndexError):
                    return None, None
            return None, None
        
        def parse_generic_serial(serial):
            """Generic parsing for other manufacturers"""
            # Pattern 1: First 2 digits are year
            if len(serial) >= 2 and serial[:2].isdigit():
                year_code = int(serial[:2])
                if year_code <= 30:
                    return 2000 + year_code, None
                elif year_code >= 80:
                    return 1900 + year_code, None
            
            # Pattern 2: Full year format (19XX or 20XX)
            year_match = re.search(r'(19\d{2}|20\d{2})', serial)
            if year_match:
                return int(year_match.group(0)), None
            
            return None, None
        
        # Calculate age and warranty from serial number
        estimated_age = None
        warranty_status = "Unknown"
        manufacture_date = None
        
        serial_number = data.get("serial_number", "")
        brand = data.get("brand", "").upper()
        
        if serial_number and serial_number != "Not found":
            manufacture_year = None
            
            # Use manufacturer-specific parsing
            if "LENNOX" in brand:
                manufacture_year, manufacture_date = parse_lennox_serial(serial_number)
            else:
                # Use generic parsing for other brands
                manufacture_year, _ = parse_generic_serial(serial_number)
            
            # Calculate age and warranty if we found a year
            if manufacture_year:
                # Create manufacture date for calculation
                # Default to January if no specific month available
                manufacture_month = 1
                if manufacture_date:
                    # Extract month number from manufacture_date like "March 2023"
                    month_names = {
                        'january': 1, 'february': 2, 'march': 3, 'april': 4,
                        'may': 5, 'june': 6, 'july': 7, 'august': 8,
                        'september': 9, 'october': 10, 'november': 11, 'december': 12
                    }
                    for month_name, month_num in month_names.items():
                        if month_name in manufacture_date.lower():
                            manufacture_month = month_num
                            break
                
                # Calculate precise age in years and months
                from dateutil.relativedelta import relativedelta
                manufacture_dt = datetime(manufacture_year, manufacture_month, 1)
                current_dt = datetime.now()
                age_delta = relativedelta(current_dt, manufacture_dt)
                
                years = age_delta.years
                months = age_delta.months
                
                # Sanity check (equipment shouldn't be more than 50 years old or in the future)
                if 0 <= years <= 50:
                    # Format age string
                    if years > 0 and months > 0:
                        estimated_age = f"{years} years {months} months"
                    elif years > 0:
                        estimated_age = f"{years} years"
                    elif months > 0:
                        estimated_age = f"{months} months"
                    else:
                        estimated_age = "Less than 1 month"
                    
                    # Calculate warranty (assuming 10-year standard warranty)
                    total_years = years + (months / 12.0)
                    years_remaining = 10 - total_years
                    if years_remaining > 1:
                        warranty_status = f"Active ({int(years_remaining)} years remaining)"
                    elif years_remaining > 0:
                        months_remaining = int(years_remaining * 12)
                        warranty_status = f"Active ({months_remaining} months remaining)"
                    else:
                        warranty_status = "Expired"
                else:
                    estimated_age = None
                    warranty_status = "Unable to determine - Manual verification needed"
            else:
                warranty_status = "Unable to determine - Manual verification needed"
        
        return DataPlateOCRResponse(
            brand=data.get("brand", "Not found"),
            model_number=data.get("model_number", "Not found"),
            serial_number=data.get("serial_number", "Not found"),
            date_of_manufacture=manufacture_date,
            estimated_age=estimated_age,
            warranty_status=warranty_status
        )
        
    except Exception as e:
        logging.error(f"OCR Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
