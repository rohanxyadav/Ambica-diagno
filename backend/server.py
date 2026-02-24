from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
import os
import logging
import uuid
import razorpay
from jose import JWTError, jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', 72))

razorpay_client = razorpay.Client(auth=(
    os.environ.get('RAZORPAY_KEY_ID', 'test'),
    os.environ.get('RAZORPAY_KEY_SECRET', 'test')
))


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    role: str = "patient"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Test(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    preparation_instructions: Optional[str] = ""
    home_collection_available: bool = True
    category: Optional[str] = "General"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Package(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    included_tests: List[str] = []
    preparation_instructions: Optional[str] = ""
    home_collection_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Membership(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    monthly_price: float
    benefits: List[str] = []
    discount_percentage: float = 0
    priority_booking: bool = False
    free_home_collection: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    user_name: str
    user_email: str
    user_phone: str
    test_type: str
    test_id: str
    test_name: str
    date: str
    time_slot: Optional[str] = None
    payment_mode: str
    amount: float

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    booking_id: str = Field(default_factory=lambda: f"AMB{uuid.uuid4().hex[:8].upper()}")
    user_id: str
    user_name: str
    user_email: str
    user_phone: str
    test_type: str
    test_id: str
    test_name: str
    date: str
    time_slot: Optional[str] = None
    payment_mode: str
    payment_status: str = "pending"
    payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount: float
    status: str = "pending"
    assigned_technician: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Report(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_id: str = Field(default_factory=lambda: f"REP{uuid.uuid4().hex[:8].upper()}")
    patient_id: str
    patient_name: str
    appointment_id: str
    booking_id: str
    test_name: str
    file_url: str
    file_name: str
    remarks: Optional[str] = ""
    status: str = "ready"
    report_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportUpload(BaseModel):
    patient_id: str
    appointment_id: str
    remarks: Optional[str] = ""
    status: str = "ready"

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    appointment_id: str
    amount: float
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    status: str = "pending"
    payment_mode: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@api_router.get("/")
async def root():
    return {"message": "Ambica Diagnostic Center API", "status": "active"}


@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role="patient"
    )
    user_doc = user.model_dump()
    user_doc["password"] = hash_password(user_data.password)
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user.id, "role": user.role})
    return {"token": token, "user": user.model_dump(), "message": "Registration successful"}


@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    user.pop("password")
    return {"token": token, "user": user, "message": "Login successful"}


@api_router.get("/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user


@api_router.get("/tests")
async def get_tests(category: Optional[str] = None):
    query = {} if not category else {"category": category}
    tests = await db.tests.find(query, {"_id": 0}).to_list(1000)
    return tests


@api_router.post("/tests")
async def create_test(test: Test, admin: Dict[str, Any] = Depends(get_admin_user)):
    test_doc = test.model_dump()
    test_doc["created_at"] = test_doc["created_at"].isoformat()
    await db.tests.insert_one(test_doc)
    return {"message": "Test created successfully", "test": test}


@api_router.put("/tests/{test_id}")
async def update_test(test_id: str, test_data: Dict[str, Any], admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.tests.update_one({"id": test_id}, {"$set": test_data})
    return {"message": "Test updated successfully"}


@api_router.delete("/tests/{test_id}")
async def delete_test(test_id: str, admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.tests.delete_one({"id": test_id})
    return {"message": "Test deleted successfully"}


@api_router.get("/packages")
async def get_packages():
    packages = await db.packages.find({}, {"_id": 0}).to_list(1000)
    return packages


@api_router.post("/packages")
async def create_package(package: Package, admin: Dict[str, Any] = Depends(get_admin_user)):
    package_doc = package.model_dump()
    package_doc["created_at"] = package_doc["created_at"].isoformat()
    await db.packages.insert_one(package_doc)
    return {"message": "Package created successfully", "package": package}


@api_router.put("/packages/{package_id}")
async def update_package(package_id: str, package_data: Dict[str, Any], admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.packages.update_one({"id": package_id}, {"$set": package_data})
    return {"message": "Package updated successfully"}


@api_router.delete("/packages/{package_id}")
async def delete_package(package_id: str, admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.packages.delete_one({"id": package_id})
    return {"message": "Package deleted successfully"}


@api_router.get("/memberships")
async def get_memberships():
    memberships = await db.memberships.find({}, {"_id": 0}).to_list(1000)
    return memberships


@api_router.post("/memberships")
async def create_membership(membership: Membership, admin: Dict[str, Any] = Depends(get_admin_user)):
    membership_doc = membership.model_dump()
    membership_doc["created_at"] = membership_doc["created_at"].isoformat()
    await db.memberships.insert_one(membership_doc)
    return {"message": "Membership created successfully", "membership": membership}


@api_router.put("/memberships/{membership_id}")
async def update_membership(membership_id: str, membership_data: Dict[str, Any], admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.memberships.update_one({"id": membership_id}, {"$set": membership_data})
    return {"message": "Membership updated successfully"}


@api_router.delete("/memberships/{membership_id}")
async def delete_membership(membership_id: str, admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.memberships.delete_one({"id": membership_id})
    return {"message": "Membership deleted successfully"}


@api_router.get("/appointments/slots")
async def get_available_slots(date: str):
    slots = []
    start_time = 6 * 60
    end_time = 8 * 60 + 30
    interval = 15
    
    for minutes in range(start_time, end_time, interval):
        hours = minutes // 60
        mins = minutes % 60
        time_str = f"{hours:02d}:{mins:02d}"
        
        booked = await db.appointments.count_documents({
            "date": date,
            "time_slot": time_str,
            "status": {"$ne": "cancelled"}
        })
        
        slots.append({
            "time": time_str,
            "available": booked < 3
        })
    
    return {"slots": slots, "date": date}


@api_router.post("/appointments")
async def create_appointment(appointment_data: AppointmentCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    appointment = Appointment(
        **appointment_data.model_dump(),
        user_id=current_user["id"],
        payment_status="pending",
        status="pending"
    )
    appointment_doc = appointment.model_dump()
    appointment_doc["created_at"] = appointment_doc["created_at"].isoformat()
    
    await db.appointments.insert_one(appointment_doc)
    return {"message": "Appointment booked successfully", "appointment": appointment, "booking_id": appointment.booking_id}


@api_router.get("/appointments")
async def get_user_appointments(current_user: Dict[str, Any] = Depends(get_current_user)):
    appointments = await db.appointments.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return appointments


@api_router.get("/appointments/all")
async def get_all_appointments(admin: Dict[str, Any] = Depends(get_admin_user)):
    appointments = await db.appointments.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return appointments


@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, update_data: Dict[str, Any], admin: Dict[str, Any] = Depends(get_admin_user)):
    await db.appointments.update_one({"id": appointment_id}, {"$set": update_data})
    return {"message": "Appointment updated successfully"}


@api_router.post("/payments/create-order")
async def create_payment_order(data: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        amount = int(data["amount"] * 100)
        
        razor_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })
        
        payment = Payment(
            user_id=current_user["id"],
            appointment_id=data.get("appointment_id", ""),
            amount=data["amount"],
            razorpay_order_id=razor_order["id"],
            payment_mode="online",
            status="pending"
        )
        
        payment_doc = payment.model_dump()
        payment_doc["created_at"] = payment_doc["created_at"].isoformat()
        await db.payments.insert_one(payment_doc)
        
        return {
            "order_id": razor_order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": os.environ.get('RAZORPAY_KEY_ID', 'test')
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment order creation failed: {str(e)}")


@api_router.post("/payments/verify")
async def verify_payment(data: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_user)):
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': data['razorpay_order_id'],
            'razorpay_payment_id': data['razorpay_payment_id'],
            'razorpay_signature': data['razorpay_signature']
        })
        
        await db.payments.update_one(
            {"razorpay_order_id": data['razorpay_order_id']},
            {"$set": {
                "razorpay_payment_id": data['razorpay_payment_id'],
                "razorpay_signature": data['razorpay_signature'],
                "status": "completed"
            }}
        )
        
        payment = await db.payments.find_one({"razorpay_order_id": data['razorpay_order_id']}, {"_id": 0})
        if payment and payment.get("appointment_id"):
            await db.appointments.update_one(
                {"id": payment["appointment_id"]},
                {"$set": {
                    "payment_status": "completed",
                    "payment_id": data['razorpay_payment_id'],
                    "status": "confirmed"
                }}
            )
        
        return {"message": "Payment verified successfully", "status": "completed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {str(e)}")


@api_router.get("/payments/history")
async def get_payment_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    payments = await db.payments.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return payments


@api_router.get("/admin/search-patients")
async def search_patients(query: str, admin: Dict[str, Any] = Depends(get_admin_user)):
    search_filter = {
        "$or": [
            {"user_name": {"$regex": query, "$options": "i"}},
            {"user_phone": {"$regex": query, "$options": "i"}},
            {"booking_id": {"$regex": query, "$options": "i"}}
        ],
        "status": "confirmed"
    }
    appointments = await db.appointments.find(search_filter, {"_id": 0}).to_list(100)
    return appointments


@api_router.post("/reports/upload")
async def upload_report(
    patient_id: str = File(...),
    appointment_id: str = File(...),
    remarks: str = File(default=""),
    status: str = File(default="ready"),
    file: UploadFile = File(...),
    admin: Dict[str, Any] = Depends(get_admin_user)
):
    try:
        appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        reports_dir = Path("/app/backend/reports")
        reports_dir.mkdir(exist_ok=True)
        
        file_extension = Path(file.filename).suffix
        if file_extension.lower() not in ['.pdf', '.jpg', '.jpeg', '.png']:
            raise HTTPException(status_code=400, detail="Only PDF and image files are allowed")
        
        unique_filename = f"{appointment['booking_id']}_{uuid.uuid4().hex[:8]}{file_extension}"
        file_path = reports_dir / unique_filename
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        report = Report(
            patient_id=patient_id,
            patient_name=appointment["user_name"],
            appointment_id=appointment_id,
            booking_id=appointment["booking_id"],
            test_name=appointment["test_name"],
            file_url=f"/reports/{unique_filename}",
            file_name=unique_filename,
            remarks=remarks,
            status=status
        )
        
        report_doc = report.model_dump()
        report_doc["report_date"] = report_doc["report_date"].isoformat()
        report_doc["uploaded_at"] = report_doc["uploaded_at"].isoformat()
        await db.reports.insert_one(report_doc)
        
        await db.appointments.update_one(
            {"id": appointment_id},
            {"$set": {"status": "completed", "report_uploaded": True}}
        )
        
        return {"message": "Report uploaded successfully", "report": report}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report upload failed: {str(e)}")


@api_router.get("/reports")
async def get_user_reports(current_user: Dict[str, Any] = Depends(get_current_user)):
    reports = await db.reports.find({"patient_id": current_user["id"]}, {"_id": 0}).sort("report_date", -1).to_list(1000)
    return reports


@api_router.get("/reports/all")
async def get_all_reports(admin: Dict[str, Any] = Depends(get_admin_user)):
    reports = await db.reports.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(1000)
    return reports


@api_router.get("/reports/{report_id}/download")
async def download_report(report_id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report["patient_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_path = Path("/app/backend/reports") / report["file_name"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=str(file_path),
        filename=report["file_name"],
        media_type="application/pdf"
    )


@api_router.delete("/reports/{report_id}")
async def delete_report(report_id: str, admin: Dict[str, Any] = Depends(get_admin_user)):
    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    file_path = Path("/app/backend/reports") / report["file_name"]
    if file_path.exists():
        file_path.unlink()
    
    await db.reports.delete_one({"id": report_id})
    return {"message": "Report deleted successfully"}


@api_router.get("/admin/stats")
async def get_admin_stats(admin: Dict[str, Any] = Depends(get_admin_user)):
    total_bookings = await db.appointments.count_documents({})
    pending_appointments = await db.appointments.count_documents({"status": "pending"})
    completed_appointments = await db.appointments.count_documents({"status": "completed"})
    
    payments = await db.payments.find({"status": "completed"}, {"_id": 0, "amount": 1}).to_list(10000)
    total_revenue = sum(p["amount"] for p in payments)
    
    pending_reports = await db.appointments.count_documents({
        "payment_status": "completed",
        "status": {"$ne": "completed"}
    })
    
    return {
        "total_bookings": total_bookings,
        "pending_appointments": pending_appointments,
        "completed_appointments": completed_appointments,
        "total_revenue": total_revenue,
        "pending_reports": pending_reports
    }


@api_router.get("/admin/users")
async def get_all_users(admin: Dict[str, Any] = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users


@api_router.post("/admin/seed-data")
async def seed_initial_data(admin: Dict[str, Any] = Depends(get_admin_user)):
    sample_tests = [
        {"id": str(uuid.uuid4()), "name": "Complete Blood Count (CBC)", "description": "Comprehensive blood analysis", "price": 350, "category": "Blood Test", "preparation_instructions": "Fasting not required", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Lipid Profile", "description": "Cholesterol and triglycerides test", "price": 500, "category": "Blood Test", "preparation_instructions": "12 hours fasting required", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Thyroid Profile", "description": "T3, T4, TSH levels", "price": 600, "category": "Hormone Test", "preparation_instructions": "No special preparation", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "HbA1c (Diabetes)", "description": "3-month average blood sugar", "price": 400, "category": "Diabetes", "preparation_instructions": "No fasting required", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Liver Function Test (LFT)", "description": "Liver health assessment", "price": 700, "category": "Blood Test", "preparation_instructions": "8 hours fasting", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    sample_packages = [
        {"id": str(uuid.uuid4()), "name": "Full Body Checkup", "description": "Comprehensive health screening with 50+ parameters", "price": 2500, "included_tests": ["CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid"], "preparation_instructions": "12 hours fasting required", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Diabetes Care Package", "description": "Complete diabetes monitoring", "price": 1200, "included_tests": ["HbA1c", "Fasting Blood Sugar", "Kidney Function"], "preparation_instructions": "8 hours fasting", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Women's Health Package", "description": "Specialized tests for women", "price": 3000, "included_tests": ["CBC", "Thyroid", "Vitamin D", "Iron Studies", "Hormonal Panel"], "preparation_instructions": "No fasting required", "home_collection_available": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    sample_memberships = [
        {"id": str(uuid.uuid4()), "name": "Basic Monthly Plan", "description": "Essential health monitoring", "monthly_price": 499, "benefits": ["10% discount on all tests", "Priority booking", "Free home collection"], "discount_percentage": 10, "priority_booking": True, "free_home_collection": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Senior Citizen Plan", "description": "Specialized care for seniors", "monthly_price": 799, "benefits": ["15% discount", "Monthly free CBC test", "Priority booking", "Free home collection", "Dedicated support"], "discount_percentage": 15, "priority_booking": True, "free_home_collection": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Family Plan", "description": "Health coverage for whole family", "monthly_price": 1499, "benefits": ["20% discount on all tests", "4 members coverage", "Free quarterly checkup", "Priority booking"], "discount_percentage": 20, "priority_booking": True, "free_home_collection": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    await db.tests.insert_many(sample_tests)
    await db.packages.insert_many(sample_packages)
    await db.memberships.insert_many(sample_memberships)
    
    return {"message": "Sample data seeded successfully"}


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
