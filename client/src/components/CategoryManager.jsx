import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDelete, MdEdit, MdAdd, MdClose } from 'react-icons/md';

const CategoryManager = ({ onClose, onUpdate }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/categories', { name: newCategory });
            setNewCategory('');
            fetchCategories();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.error || 'Error adding category');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axios.put(`/api/categories/${id}`, { name: editName });
            setEditingId(null);
            fetchCategories();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError('Error updating category');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category? Transactions will be moved to "General".')) return;
        try {
            await axios.delete(`/api/categories/${id}`);
            fetchCategories();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Manage Categories</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>
                        <MdClose />
                    </button>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'var(--danger-bg)', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category..."
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.5rem' }}>
                        <MdAdd size={24} />
                    </button>
                </form>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {categories.length === 0 ? <p>No custom categories.</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {categories.map(cat => (
                                <li key={cat._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {editingId === cat._id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdate(cat._id)} style={{ color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer' }}>💾</button>
                                            <button onClick={() => setEditingId(null)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{cat.name}</span>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                                                    <MdEdit />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;
