from datetime import datetime
from app import db

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.String(50), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cases = db.relationship('Case', backref='patient', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Case(db.Model):
    __tablename__ = 'cases'
    
    id = db.Column(db.String(50), primary_key=True)
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.id'), nullable=False)
    position = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    records = db.relationship('WoundRecord', backref='case', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'position': self.position,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class WoundRecord(db.Model):
    __tablename__ = 'wound_records'
    
    id = db.Column(db.BigInteger, primary_key=True)
    case_id = db.Column(db.String(50), db.ForeignKey('cases.id'), nullable=False)
    image_path = db.Column(db.String(255))
    mask_path = db.Column(db.String(255))
    area = db.Column(db.Decimal(10,2))
    measurement_date = db.Column(db.Date, nullable=False)
    measurement_time = db.Column(db.Time, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'case_id': self.case_id,
            'area': float(self.area) if self.area else None,
            'measurement_date': self.measurement_date.isoformat(),
            'measurement_time': self.measurement_time.isoformat(),
            'created_at': self.created_at.isoformat()
        }