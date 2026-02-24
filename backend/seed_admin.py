import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_admin():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ambica_diagnostic')]
    
    admin_exists = await db.users.find_one({"email": "admin@ambica.com"})
    if not admin_exists:
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "Admin User",
            "email": "admin@ambica.com",
            "phone": "+91 9876543210",
            "password": pwd_context.hash("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("✅ Admin user created: admin@ambica.com / admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    patient_exists = await db.users.find_one({"email": "patient@ambica.com"})
    if not patient_exists:
        patient_user = {
            "id": str(uuid.uuid4()),
            "name": "Demo Patient",
            "email": "patient@ambica.com",
            "phone": "+91 9876543211",
            "password": pwd_context.hash("patient123"),
            "role": "patient",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(patient_user)
        print("✅ Demo patient user created: patient@ambica.com / patient123")
    else:
        print("ℹ️  Demo patient user already exists")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
