import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { currencyNames } from '../utils/currencyNames';

const CurrencySelector = () => {
    const { currency, changeCurrency, availableCurrencies, loading, refreshRates } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const filteredCurrencies = availableCurrencies.filter(c => {
        const name = currencyNames[c] || '';
        return c.toLowerCase().includes(searchTerm.toLowerCase()) ||
            name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleToggle = () => {
        if (!isOpen) {
            setSearchTerm('');
            setActiveIndex(0);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 50);
        }
        setIsOpen(!isOpen);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCurrencies.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCurrencies.length) % filteredCurrencies.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCurrencies[activeIndex]) {
                changeCurrency(filteredCurrencies[activeIndex]);
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (listRef.current && listRef.current.children[activeIndex]) {
            listRef.current.children[activeIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [activeIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return null;

    return (
        <div className="currency-selector-container" ref={dropdownRef} style={{ position: 'relative' }} onKeyDown={handleKeyDown}>
            <button
                onClick={handleToggle}
                className="card currency-toggle"
                style={{
                    padding: '0.6rem 1.2rem',
                    margin: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '130px',
                    justifyContent: 'space-between',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    border: isOpen ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.3)', // Increased contrast from 0.1 to 0.3
                    color: 'var(--text-primary)', // Explicit text color
                    background: 'var(--card-bg)' // Ensure consistent background
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="text-glow" style={{ fontSize: '1rem' }}>{currency}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 'normal' }}>{currencyNames[currency] || 'Currency'}</span>
                </div>
                <span style={{ fontSize: '0.7rem', opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </button>

            {isOpen && (
                <div
                    className="card animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        zIndex: 10000,
                        padding: '1.25rem',
                        maxHeight: '450px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '320px',
                        boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                        background: 'rgba(15, 23, 42, 0.98)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                >
                    <div className="form-group" style={{ marginBottom: '1rem', position: 'relative' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search by code or name..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setActiveIndex(0);
                            }}
                            className="search-input"
                            style={{
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                height: '3rem',
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }} ref={listRef}>
                        {filteredCurrencies.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem' }}>
                                {filteredCurrencies.map((c, index) => (
                                    <div
                                        key={c}
                                        onClick={() => {
                                            changeCurrency(c);
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-md)',
                                            background: index === activeIndex ? 'rgba(99, 102, 241, 0.2)' : (c === currency ? 'var(--primary-glow)' : 'transparent'),
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem',
                                            color: 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: index === activeIndex ? '1px solid var(--primary-glow)' : '1px solid transparent'
                                        }}
                                        className="currency-option"
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '700' }}>{c}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{currencyNames[c] || 'Other'}</span>
                                        </div>
                                        {c === currency && <span style={{ fontSize: '0.8rem' }}>✓</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', opacity: 0.5 }}>
                                No currencies found
                            </div>
                        )}
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', opacity: 0.4, textAlign: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Use ↑ ↓ and Enter to navigate</span>
                        <span onClick={refreshRates} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Refresh Rates</span>
                    </div>
                </div>
            )}
            <style>
                {`
                    .currency-option:hover {
                        transform: translateX(4px);
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: var(--primary-color);
                        border-radius: 10px;
                    }
                    .currency-toggle:hover {
                        border-color: var(--primary-color) !important;
                    }
                `}
            </style>
        </div>
    );
};

export default CurrencySelector;
