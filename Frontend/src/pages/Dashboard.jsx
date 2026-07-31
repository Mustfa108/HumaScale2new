import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { LayoutDashboard, Users, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard').then(res => setStats(res.data));
    }, []);

    if (!stats) return <p>جاري التحميل...</p>;

    return (
        <div style={{padding: '30px', backgroundColor: '#f9fafb', minHeight: '100vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '30px'}}>
                <h1>Dashboard Overview</h1>
                <button onClick={() => navigate('/assessment')} style={styles.mainBtn}>ابدأ تقييم جديد</button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
                <div style={styles.statCard}><Users /> <h3>الفرق</h3> <p>{stats.teams_count}</p></div>
                <div style={styles.statCard}><ClipboardCheck /> <h3>التقييمات</h3> <p>{stats.total_assessments}</p></div>
                <div style={styles.statCard}><LayoutDashboard /> <h3>الجاهزية</h3> <p>{stats.avg_readiness}%</p></div>
            </div>
        </div>
    );
}
const styles = {
    statCard: { padding: '20px', backgroundColor: '#fff', borderRadius: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'},
    mainBtn: { padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer'}
};