import { Schema, model } from 'mongoose';

const AuditLogSchema = new Schema({
    service: { type: String, required: true }, // 'inventory', 'security', etc.
    action: { type: String, required: true },  // 'CREATE_ASSET', 'LOGIN', etc.
    details: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const AuditLog = model('AuditLog', AuditLogSchema);