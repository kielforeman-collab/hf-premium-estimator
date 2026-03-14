'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Calculator, FileText, Printer, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, PricingSettings, calculateTotals, LineItem } from '@/lib/calculator';
import { generateAIProposal } from '@/lib/gemini';

export default function PaintEstimator() {
  const [clientName, setClientName] = useState('');
  const [quoteId, setQuoteId] = useState('');

  useEffect(() => {
    setQuoteId(`QT-${Date.now().toString().slice(-6)}`);
  }, []);
  const formId = useId();
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Living Room', length: 15, width: 20, height: 8, windows: 2, doors: 1, complexity: 1 }
  ]);
  const [paintItems, setPaintItems] = useState<LineItem[]>([]);
  const [sundryItems, setSundryItems] = useState<LineItem[]>([]);
  const [laborItems, setLaborItems] = useState<LineItem[]>([]);
  const [settings, setSettings] = useState<PricingSettings>({
    laborRate: 70,
    paintCost: 95,
    markup: 20,
    taxRate: 13,
    ehfFee: 1.00
  });

  const [proposal, setProposal] = useState('');
  const [isProposalLoading, setIsProposalLoading] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

  const totals = useMemo(() => calculateTotals(rooms, settings, [...paintItems, ...sundryItems], laborItems), [rooms, settings, paintItems, sundryItems, laborItems]);

  const addRoom = () => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: 'New Area',
      length: 12,
      width: 12,
      height: 8,
      windows: 1,
      doors: 1,
      complexity: 1
    };
    setRooms([...rooms, newRoom]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addPaintItem = () => {
    setPaintItems([...paintItems, { id: crypto.randomUUID(), item: 'New Paint', description: '', quantity: 1, amount: 0, size: 'Gallons' }]);
  };

  const updatePaintItem = (id: string, updates: Partial<LineItem>) => {
    setPaintItems(paintItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removePaintItem = (id: string) => {
    setPaintItems(paintItems.filter(item => item.id !== id));
  };

  const addSundryItem = () => {
    setSundryItems([...sundryItems, { id: crypto.randomUUID(), item: 'New Sundry', description: '', quantity: 1, amount: 0, size: 'Each' }]);
  };

  const updateSundryItem = (id: string, updates: Partial<LineItem>) => {
    setSundryItems(sundryItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeSundryItem = (id: string) => {
    setSundryItems(sundryItems.filter(item => item.id !== id));
  };

  const addLaborItem = () => {
    setLaborItems([...laborItems, { id: crypto.randomUUID(), item: 'New Labor Item', description: '', quantity: 1, amount: 0 }]);
  };

  const updateLaborItem = (id: string, updates: Partial<LineItem>) => {
    setLaborItems(laborItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeLaborItem = (id: string) => {
    setLaborItems(laborItems.filter(item => item.id !== id));
  };

  const handleGenerateProposal = async () => {
    setIsProposalLoading(true);
    try {
      const paintList = paintItems.map(m => `${m.quantity}x ${m.size && m.size !== 'Each' ? m.size + ' ' : ''}${m.item} ${m.description ? `(${m.description}) ` : ''}($${(m.amount * (m.quantity || 1)).toFixed(2)})`).join(', ');
      const sundryList = sundryItems.map(m => `${m.quantity}x ${m.size && m.size !== 'Each' ? m.size + ' ' : ''}${m.item} ${m.description ? `(${m.description}) ` : ''}($${(m.amount * (m.quantity || 1)).toFixed(2)})`).join(', ');
      const laborList = laborItems.map(l => `${l.quantity}x ${l.item} ${l.description ? `(${l.description}) ` : ''}($${(l.amount * (l.quantity || 1)).toFixed(2)})`).join(', ');
      const context = `
        Paint Materials: ${paintList || 'None'}
        Sundries: ${sundryList || 'None'}
        Labour: ${laborList || 'None'}
      `;
      const text = await generateAIProposal(clientName || 'Valued Customer', rooms, totals.totalWallArea, totals.finalTotal, context);
      setProposal(text || '');
      setShowProposalModal(true);
    } catch (error) {
      alert('Error generating proposal.');
    } finally {
      setIsProposalLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      setRooms([{ id: crypto.randomUUID(), name: 'Living Room', length: 15, width: 20, height: 8, windows: 2, doors: 1, complexity: 1 }]);
      setPaintItems([]);
      setSundryItems([]);
      setLaborItems([]);
      setClientName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#c5a059] shadow-lg bg-[#0a192f]">
              <Image
                src="/HFLogo.png"
                alt="HF Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#0a192f] font-serif">
                HF <span className="text-[#c5a059]">Estimator</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">Premium Painting & Finishing</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0a192f] rounded-xl hover:bg-[#112240] transition shadow-md"
            >
              <Printer size={16} /> Print Estimate
            </button>
          </div>
        </header>

        {/* Print Only Header */}
        <div className="hidden print:block mb-10 border-b-4 border-[#0a192f] pb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#c5a059] bg-[#0a192f]">
                <Image
                  src="/HFLogo.png"
                  alt="HF Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-[#0a192f] font-serif">Painting Estimate</h1>
                <p className="text-slate-500 mt-1 font-bold text-xs uppercase tracking-widest">HF Premium Finishing Services</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900 uppercase">Estimate ID: {quoteId}</div>
              <div className="text-slate-500">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div className="mt-8">
            <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Prepared For:</h4>
            <div className="text-xl font-bold">{clientName || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6 print:col-span-12">

            {/* Client Info */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 print:hidden">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 font-serif text-[#0a192f]">
                <Calculator className="text-[#c5a059]" size={20} /> Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor={`${formId}-client`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Name</label>
                  <input
                    id={`${formId}-client`}
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Benjamin Moore"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c5a059] outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`${formId}-quote`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quote Number</label>
                  <input
                    id={`${formId}-quote`}
                    type="text"
                    value={quoteId}
                    onChange={(e) => setQuoteId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c5a059] outline-none transition"
                  />
                </div>
              </div>
            </section>

            {/* Rooms List */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 print:mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 font-serif text-[#0a192f]">
                  <Calculator className="text-[#c5a059]" size={20} /> Areas to Paint
                </h2>
                <button
                  onClick={addRoom}
                  className="flex items-center gap-1 text-sm font-bold text-[#c5a059] hover:text-[#a6864a] transition print:hidden"
                >
                  <Plus size={16} /> Add Room
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {rooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group"
                    >
                      <button
                        onClick={() => removeRoom(room.id)}
                        aria-label="Remove room"
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition print:hidden"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label htmlFor={`room-name-${room.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Room Name</label>
                          <input
                            id={`room-name-${room.id}`}
                            type="text"
                            value={room.name}
                            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                            className="w-full bg-transparent font-bold text-slate-800 border-b border-transparent focus:border-[#c5a059] outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={`room-comp-${room.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Complexity</label>
                          <select
                            id={`room-comp-${room.id}`}
                            value={room.complexity}
                            onChange={(e) => updateRoom(room.id, { complexity: parseFloat(e.target.value) })}
                            className="w-full bg-white px-2 py-1 text-sm border border-slate-200 rounded-md outline-none"
                          >
                            <option value={1}>Standard (1x)</option>
                            <option value={1.25}>Detailed (1.25x)</option>
                            <option value={1.5}>Vaulted (1.5x)</option>
                            <option value={2}>High Detail (2x)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                        {[
                          { label: 'Length (ft)', key: 'length' },
                          { label: 'Width (ft)', key: 'width' },
                          { label: 'Height (ft)', key: 'height' },
                          { label: 'Windows', key: 'windows' },
                          { label: 'Doors', key: 'doors' },
                        ].map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{field.label}</label>
                            <input
                              type="number"
                              value={room[field.key as keyof Room]}
                              onChange={(e) => updateRoom(room.id, { [field.key]: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-white px-3 py-1 text-sm border border-slate-200 rounded-md outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Line Items */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="space-y-8">
                {/* Materials */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 font-serif text-[#0a192f]">
                      <Calculator className="text-[#c5a059]" size={20} /> Paint
                    </h2>
                    <button
                      onClick={addPaintItem}
                      className="flex items-center gap-1 text-sm font-bold text-[#c5a059] hover:text-[#a6864a] transition print:hidden"
                    >
                      <Plus size={16} /> Add Paint
                    </button>
                  </div>
                  <div className="space-y-3">
                    {paintItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
                        <div className="w-1/3 sm:w-48 space-y-1">
                          <label htmlFor={`paint-item-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Item</label>
                          <input
                            id={`paint-item-${item.id}`}
                            type="text"
                            value={item.item}
                            onChange={(e) => updatePaintItem(item.id, { item: e.target.value })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-[150px]">
                          <label htmlFor={`paint-desc-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                          <input
                            id={`paint-desc-${item.id}`}
                            type="text"
                            value={item.description}
                            onChange={(e) => updatePaintItem(item.id, { description: e.target.value })}
                            placeholder="Optional details..."
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label htmlFor={`paint-size-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Size</label>
                          <select
                            id={`paint-size-${item.id}`}
                            value={item.size || 'Gallon'}
                            onChange={(e) => updatePaintItem(item.id, { size: e.target.value })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059] bg-white"
                          >
                            <option value="Gallon">Gallon</option>
                            <option value="Litre">Litre</option>
                            <option value="5 Gallon">5 Gallon</option>
                          </select>
                        </div>
                        <div className="w-20 space-y-1">
                          <label htmlFor={`paint-qty-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                          <input
                            id={`paint-qty-${item.id}`}
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updatePaintItem(item.id, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label htmlFor={`paint-amt-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Price ($)</label>
                          <input
                            id={`paint-amt-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updatePaintItem(item.id, { amount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1 hidden sm:block">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Total</label>
                          <div className="w-full px-3 py-1 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-md">
                            ${(item.amount * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removePaintItem(item.id)}
                          aria-label={`Remove material ${item.item}`}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition print:hidden"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {paintItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No additional paint added.</p>
                    )}
                    {paintItems.length > 0 && (
                      <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                        <div className="text-sm">
                          <span className="text-slate-500 font-medium">Paint Subtotal: </span>
                          <span className="font-bold text-[#0a192f]">${paintItems.reduce((acc, item) => acc + (item.amount * (item.quantity || 1)), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sundries */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 font-serif text-[#0a192f]">
                      <Calculator className="text-[#c5a059]" size={20} /> Sundries
                    </h2>
                    <button
                      onClick={addSundryItem}
                      className="flex items-center gap-1 text-sm font-bold text-[#c5a059] hover:text-[#a6864a] transition print:hidden"
                    >
                      <Plus size={16} /> Add Sundry
                    </button>
                  </div>
                  <div className="space-y-3">
                    {sundryItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
                        <div className="w-1/3 sm:w-48 space-y-1">
                          <label htmlFor={`sundry-item-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Item</label>
                          <input
                            id={`sundry-item-${item.id}`}
                            type="text"
                            value={item.item}
                            onChange={(e) => updateSundryItem(item.id, { item: e.target.value })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-[200px]">
                          <label htmlFor={`sundry-desc-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                          <input
                            id={`sundry-desc-${item.id}`}
                            type="text"
                            value={item.description}
                            onChange={(e) => updateSundryItem(item.id, { description: e.target.value })}
                            placeholder="Optional details..."
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <label htmlFor={`sundry-qty-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                          <input
                            id={`sundry-qty-${item.id}`}
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateSundryItem(item.id, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label htmlFor={`sundry-amt-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Price ($)</label>
                          <input
                            id={`sundry-amt-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateSundryItem(item.id, { amount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1 hidden sm:block">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Total</label>
                          <div className="w-full px-3 py-1 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-md">
                            ${(item.amount * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeSundryItem(item.id)}
                          aria-label={`Remove material ${item.item}`}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition print:hidden"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {sundryItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No additional sundries added.</p>
                    )}
                    {sundryItems.length > 0 && (
                      <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                        <div className="text-sm">
                          <span className="text-slate-500 font-medium">Sundries Subtotal: </span>
                          <span className="font-bold text-[#0a192f]">${sundryItems.reduce((acc, item) => acc + (item.amount * (item.quantity || 1)), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Labour */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 font-serif text-[#0a192f]">
                      <Calculator className="text-[#c5a059]" size={20} /> Labour
                    </h2>
                    <button
                      onClick={addLaborItem}
                      className="flex items-center gap-1 text-sm font-bold text-[#c5a059] hover:text-[#a6864a] transition print:hidden"
                    >
                      <Plus size={16} /> Add Labour
                    </button>
                  </div>
                  <div className="space-y-3">
                    {laborItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-end flex-wrap sm:flex-nowrap">
                        <div className="w-1/3 sm:w-48 space-y-1">
                          <label htmlFor={`lab-item-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Item</label>
                          <input
                            id={`lab-item-${item.id}`}
                            type="text"
                            value={item.item}
                            onChange={(e) => updateLaborItem(item.id, { item: e.target.value })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-[200px]">
                          <label htmlFor={`lab-desc-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                          <input
                            id={`lab-desc-${item.id}`}
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLaborItem(item.id, { description: e.target.value })}
                            placeholder="Optional details..."
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-20 space-y-1">
                          <label htmlFor={`lab-qty-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Quantity</label>
                          <input
                            id={`lab-qty-${item.id}`}
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => updateLaborItem(item.id, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <label htmlFor={`lab-amt-${item.id}`} className="text-[10px] font-bold text-slate-400 uppercase">Price ($)</label>
                          <input
                            id={`lab-amt-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateLaborItem(item.id, { amount: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-1 text-sm border border-slate-200 rounded-md outline-none focus:border-[#c5a059]"
                          />
                        </div>
                        <div className="w-24 space-y-1 hidden sm:block">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Total</label>
                          <div className="w-full px-3 py-1 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-md">
                            ${(item.amount * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeLaborItem(item.id)}
                          aria-label={`Remove labour item ${item.item}`}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition print:hidden"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {laborItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic">No additional labour items added.</p>
                    )}
                    {laborItems.length > 0 && (
                      <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                        <div className="text-sm">
                          <span className="text-slate-500 font-medium">Labour Subtotal: </span>
                          <span className="font-bold text-[#0a192f]">${laborItems.reduce((acc, item) => acc + (item.amount * (item.quantity || 1)), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Settings */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 print:hidden">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 font-serif text-[#0a192f]">
                <Calculator className="text-[#c5a059]" size={20} /> Pricing Settings
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Labour Rate ($/hr)', key: 'laborRate' },
                  { label: 'Paint Cost ($/gal)', key: 'paintCost' },
                  { label: 'BC EHF ($/gal)', key: 'ehfFee' },
                  { label: 'Markup (%)', key: 'markup' },
                  { label: 'Tax Rate (%)', key: 'taxRate' },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label htmlFor={`setting-${field.key}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                    <input
                      id={`setting-${field.key}`}
                      type="number"
                      min="0"
                      step={field.key === 'markup' || field.key === 'taxRate' ? '0.1' : field.key === 'ehfFee' ? '0.01' : '1'}
                      value={settings[field.key as keyof PricingSettings]}
                      onChange={(e) => setSettings({ ...settings, [field.key]: Math.max(0, parseFloat(e.target.value) || 0) })}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c5a059] outline-none transition"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-[#c5a059]/20 overflow-hidden sticky top-8">
              <div className="bg-[#0a192f] text-white p-5">
                <h3 className="font-bold text-lg uppercase tracking-wider text-[#c5a059] font-serif">Estimate Summary</h3>
                <p className="text-slate-400 text-xs truncate">Project: {clientName || 'Untitled'}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span className="text-sm">Total Area</span>
                  <span className="font-bold text-slate-900">{Math.round(totals.totalWallArea)} sq ft</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-sm">Estimated Paint</span>
                  <span className="font-bold text-slate-900">{totals.gallonsNeeded} gal</span>
                </div>
                {totals.ehfAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span className="text-xs">BC EHF Included</span>
                    <span className="text-xs font-semibold">${totals.ehfAmount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-slate-100" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Materials Total</span>
                    <span className="font-semibold">${totals.materialCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Labor Total</span>
                    <span className="font-semibold">${totals.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#c5a059] font-medium">
                    <span>Profit Margin</span>
                    <span>${totals.markupAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-50">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Total Estimate</span>
                      <div className="text-3xl font-black text-slate-900">
                        ${totals.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-right text-slate-400 text-[10px] italic">
                      Inc. ${totals.taxAmount.toFixed(2)} tax
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isProposalLoading || rooms.length === 0}
                    className="w-full py-3 bg-[#c5a059] text-white rounded-xl font-bold shadow-lg hover:bg-[#a6864a] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileText size={18} /> {isProposalLoading ? 'Drafting...' : 'AI Proposal Writer'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-[#0a192f] mb-2">Professional Value</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculations assume 1 gallon covers 400 sq ft (2 coats). Complexity multipliers increase labor time for high ceilings or heavy furniture masking.
              </p>
            </div>
          </div>

          {/* Print Only Summary */}
          <div className="hidden print:block col-span-12 mt-10">
            <div className="space-y-6">
              {/* Rooms Table in Print */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300">
                    <th className="py-2 px-3 font-bold text-xs uppercase">Area</th>
                    <th className="py-2 px-3 font-bold text-xs uppercase">Dimensions</th>
                    <th className="py-2 px-3 font-bold text-xs uppercase text-right">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(r => (
                    <tr key={r.id} className="border-b border-slate-200">
                      <td className="py-2 px-3 text-sm">{r.name}</td>
                      <td className="py-2 px-3 text-xs text-slate-500">{r.length}&apos;x{r.width}&apos; ({r.height}&apos; High)</td>
                      <td className="py-2 px-3 text-sm text-right">{r.complexity}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Line Items in Print */}
              {((paintItems.length > 0 || sundryItems.length > 0) || laborItems.length > 0) && (
                <div className="grid grid-cols-2 gap-8">
                  {(paintItems.length > 0 || sundryItems.length > 0) && (
                    <div>
                      {paintItems.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Paint</h4>
                          <ul className="text-sm space-y-1">
                            {paintItems.map(item => (
                              <li key={item.id} className="flex justify-between">
                                <span>
                                  <span className="font-semibold">{item.quantity}x {item.size && item.size !== 'Each' ? item.size + ' ' : ''}{item.item}</span>
                                  {item.description && <span className="text-slate-500 ml-2 italic">- {item.description}</span>}
                                </span>
                                <span>${(item.amount * (item.quantity || 1)).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {sundryItems.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Sundries</h4>
                          <ul className="text-sm space-y-1">
                            {sundryItems.map(item => (
                              <li key={item.id} className="flex justify-between">
                                <span>
                                  <span className="font-semibold">{item.quantity}x {item.size && item.size !== 'Each' ? item.size + ' ' : ''}{item.item}</span>
                                  {item.description && <span className="text-slate-500 ml-2 italic">- {item.description}</span>}
                                </span>
                                <span>${(item.amount * (item.quantity || 1)).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {laborItems.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Labour</h4>
                      <ul className="text-sm space-y-1">
                        {laborItems.map(item => (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              <span className="font-semibold">{item.quantity}x {item.item}</span>
                              {item.description && <span className="text-slate-500 ml-2 italic">- {item.description}</span>}
                            </span>
                            <span>${(item.amount * (item.quantity || 1)).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-6 border-t-2 border-slate-100">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Materials Total:</span>
                    <span className="font-semibold">${totals.materialCost.toFixed(2)}</span>
                  </div>
                  {totals.ehfAmount > 0 && (
                    <div className="flex justify-between text-sm text-slate-400 -mt-2">
                      <span className="text-xs pl-2">â†³ Includes BC EHF:</span>
                      <span className="text-xs">${totals.ehfAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Labour Services:</span>
                    <span className="font-semibold">${totals.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Taxes ({settings.taxRate}%):</span>
                    <span className="font-semibold">${totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl border-t-2 border-slate-900 pt-3">
                    <span className="font-black uppercase">Total (CAD):</span>
                    <span className="font-black">${totals.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 id="proposal-title" className="text-xl font-bold text-slate-800 flex items-center gap-2 font-serif">
                  <FileText className="text-[#c5a059]" size={20} /> AI Project Proposal
                </h3>
                <button
                  onClick={() => setShowProposalModal(false)}
                  aria-label="Close proposal modal"
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {proposal}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="px-6 py-2 font-semibold text-slate-600 hover:text-slate-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(proposal);
                    alert('Proposal copied to clipboard!');
                  }}
                  className="px-6 py-2 bg-[#c5a059] text-white rounded-lg font-bold hover:bg-[#a6864a] shadow-md transition"
                >
                  Copy to Clipboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
