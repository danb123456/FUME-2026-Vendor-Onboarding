
import React, { useState } from 'react';
import { 
  VendorFormData, 
  EquipmentItem, 
  StaffMember, 
  PaperworkFile 
} from './types';
import { 
  EQUIPMENT_TYPES, 
  POWER_SOCKETS, 
  STAFF_ROLES, 
  PAPERWORK_ITEMS, 
  MIN_STAFF_COUNT, 
  MIN_EXPIRY_DATE 
} from './constants';
import SectionHeader from './components/SectionHeader';
import FormField from './components/FormField';
import FileInput from './components/FileInput';

/**
 * PASTE YOUR GOOGLE APPS SCRIPT URL BELOW
 * It should look something like: 
 * https://script.google.com/macros/s/AKfycby..._.../exec
 */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzk7ia8CJ5xf0CieCr6hxTul1MZ1UzwJHycgNETkWI1Ywc8HiYAAllJrvmak2LG9Sk/exec';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState<VendorFormData>({
    vendorId: '',
    tradingName: '',
    contactName: '',
    email: '',
    phone: '',
    standType: '',
    externalSpace: 'None',
    externalSpaceReason: '',
    branding: null,
    powerSource: '',
    equipment: [],
    paperwork: PAPERWORK_ITEMS.reduce((acc, item) => {
      acc[item.id] = { file: null, expiry: '' };
      return acc;
    }, {} as { [key: string]: PaperworkFile }),
    paperworkStatus: '',
    menu: {
      dish3: { desc: '', ingredients: '', photo: null },
      dish75: { desc: '', ingredients: '', photo: null },
      dish15: { desc: '', ingredients: '', photo: null }
    },
    staff: [],
    vehicleReg: '',
    instagram: '',
    comments: ''
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'FUME2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const addEquipment = () => {
    const newItem: EquipmentItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: EQUIPMENT_TYPES[0],
      socket: POWER_SOCKETS[0]
    };
    setFormData(prev => ({ ...prev, equipment: [...prev.equipment, newItem] }));
  };

  const removeEquipment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(item => item.id !== id)
    }));
  };

  const addStaff = () => {
    const newStaff: StaffMember = {
      id: Math.random().toString(36).substr(2, 9),
      role: STAFF_ROLES[0]
    };
    setFormData(prev => ({ ...prev, staff: [...prev.staff, newStaff] }));
  };

  const removeStaff = (id: string) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter(s => s.id !== id)
    }));
  };

  const validateExpiry = (date: string) => {
    if (!date) return true;
    return new Date(date) >= new Date(MIN_EXPIRY_DATE);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.staff.length < MIN_STAFF_COUNT) {
      alert(`FUME Festival requires at least ${MIN_STAFF_COUNT} staff members.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submissionPayload: any = { ...formData };
      
      if (formData.branding) submissionPayload.branding = await fileToBase64(formData.branding);
      
      for (const key of Object.keys(formData.paperwork)) {
        if (formData.paperwork[key].file) {
          submissionPayload.paperwork[key].fileData = await fileToBase64(formData.paperwork[key].file as File);
          submissionPayload.paperwork[key].fileName = formData.paperwork[key].file?.name;
          delete submissionPayload.paperwork[key].file;
        }
      }

      for (const dish of ['dish3', 'dish75', 'dish15']) {
        const dishData = (formData.menu as any)[dish];
        if (dishData.photo) {
          submissionPayload.menu[dish].photoData = await fileToBase64(dishData.photo);
          submissionPayload.menu[dish].photoName = dishData.photo.name;
          delete (submissionPayload.menu as any)[dish].photo;
        }
      }

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert("There was an error updating the spreadsheet. Please contact the administrator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-bg p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">FUME 2026</h1>
            <p className="text-gray-500 mt-2">Vendor Onboarding Portal</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="Enter Password"
                required
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
            >
              Access Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg">
          <div className="text-green-500 text-6xl mb-6">✓</div>
          <h2 className="text-3xl font-bold mb-4">Submission Received!</h2>
          <p className="text-gray-600 mb-8">
            Thank you, {formData.tradingName}. Your details and files have been successfully uploaded to the FUME Festival 2026 spreadsheet. 
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition"
          >
            Submit Another Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">FUME FESTIVAL 2026</h1>
        <p className="text-xl text-gray-600 font-medium">Official Vendor Onboarding Portal</p>
        <div className="mt-6 inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
          Allianz Stadium • June 2026
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 1: Vendor Details" />
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Vendor ID" 
              required 
              helper="This matches your row in the spreadsheet"
              value={formData.vendorId}
              onChange={(v) => setFormData({...formData, vendorId: v})}
            />
            <FormField 
              label="Trading Name" 
              required
              value={formData.tradingName}
              onChange={(v) => setFormData({...formData, tradingName: v})}
            />
            <FormField 
              label="Contact Name" 
              required
              value={formData.contactName}
              onChange={(v) => setFormData({...formData, contactName: v})}
            />
            <FormField 
              label="Email Address" 
              type="email" 
              required
              value={formData.email}
              onChange={(v) => setFormData({...formData, email: v})}
            />
            <FormField 
              label="Phone Number" 
              required
              value={formData.phone}
              onChange={(v) => setFormData({...formData, phone: v})}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 2: Stand Design" />
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Van / Shack</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.standType}
                  onChange={(e) => setFormData({...formData, standType: e.target.value as any})}
                  required
                >
                  <option value="">Select option...</option>
                  <option value="Van">Van</option>
                  <option value="Shack">Shack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">External Space (outside cover)</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.externalSpace}
                  onChange={(e) => setFormData({...formData, externalSpace: e.target.value as any})}
                  required
                >
                  <option value="None">None</option>
                  <option value="1x1m">1x1m</option>
                  <option value="2x2m">2x2m</option>
                  <option value="3x3m">3x3m</option>
                </select>
              </div>
            </div>
            <FormField 
              label="Reason for External Space" 
              placeholder="Explain why you need extra space..."
              value={formData.externalSpaceReason}
              onChange={(v) => setFormData({...formData, externalSpaceReason: v})}
            />
            <FileInput 
              label="Branding Upload (PDF/Images)" 
              accept=".pdf,image/*"
              onChange={(f) => setFormData({...formData, branding: f})}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 3: Equipment and Power" />
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Power Source</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.powerSource}
                onChange={(e) => setFormData({...formData, powerSource: e.target.value as any})}
                required
              >
                <option value="">Select power source...</option>
                <option value="FUME/Venue Supply">FUME/Venue Supply</option>
                <option value="Own Generator">Own Generator</option>
              </select>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Equipment List</h3>
                <button 
                  type="button" 
                  onClick={addEquipment}
                  className="bg-black hover:bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                >
                  + Add Equipment
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.equipment.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipment</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                        value={item.type}
                        onChange={(e) => {
                          const newList = [...formData.equipment];
                          newList[index].type = e.target.value;
                          setFormData({...formData, equipment: newList});
                        }}
                      >
                        {EQUIPMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Power Socket</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                        value={item.socket}
                        onChange={(e) => {
                          const newList = [...formData.equipment];
                          newList[index].socket = e.target.value;
                          setFormData({...formData, equipment: newList});
                        }}
                      >
                        {POWER_SOCKETS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeEquipment(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {formData.equipment.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No equipment added yet.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 4: Paperwork" />
          <div className="p-8 space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>Deadlines:</strong> Submission must be completed by <strong>14th February 2026</strong>. 
                All items must be in date until <strong>June 14th 2026</strong> and specifically designed for 
                FUME Festival at Allianz Stadium.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {PAPERWORK_ITEMS.map((item) => (
                <div key={item.id} className="space-y-3">
                  <FileInput 
                    label={item.label}
                    accept=".pdf,image/*"
                    onChange={(f) => {
                      const newPaperwork = { ...formData.paperwork };
                      newPaperwork[item.id].file = f;
                      setFormData({...formData, paperwork: newPaperwork});
                    }}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiration Date</label>
                    <input 
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md outline-none transition ${
                        formData.paperwork[item.id].expiry && !validateExpiry(formData.paperwork[item.id].expiry) 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-2 focus:ring-orange-500'
                      }`}
                      onChange={(e) => {
                        const newPaperwork = { ...formData.paperwork };
                        newPaperwork[item.id].expiry = e.target.value;
                        setFormData({...formData, paperwork: newPaperwork});
                      }}
                    />
                    {formData.paperwork[item.id].expiry && !validateExpiry(formData.paperwork[item.id].expiry) && (
                      <p className="text-red-500 text-xs mt-1 font-semibold">Warning: Date must be after June 14th 2026</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Paperwork finished?</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.paperworkStatus}
                onChange={(e) => setFormData({...formData, paperworkStatus: e.target.value as any})}
                required
              >
                <option value="">Select status...</option>
                <option value="Yes">Yes</option>
                <option value="Yes but need to renew documents">Yes but need to renew documents</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 5: Menu Offerings" />
          <div className="p-8 space-y-12">
            {[
              { key: 'dish3', price: '£3', label: 'Starter / Snack Dish' },
              { key: 'dish75', price: '£7.50', label: 'Mid-Tier / Side Dish' },
              { key: 'dish15', price: '£15', label: 'Main / Full Portion Dish' }
            ].map((dish) => (
              <div key={dish.key} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-600 text-white text-xl font-bold px-4 py-1 rounded-lg">{dish.price}</span>
                  <h3 className="text-lg font-bold text-gray-800">{dish.label}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField 
                      label="Item Description" 
                      placeholder="Describe the dish..."
                      value={(formData.menu as any)[dish.key].desc}
                      onChange={(v) => {
                        const newMenu = { ...formData.menu };
                        (newMenu as any)[dish.key].desc = v;
                        setFormData({...formData, menu: newMenu});
                      }}
                    />
                    <FormField 
                      label="Ingredients" 
                      placeholder="List all key ingredients (for allergen tracking)..."
                      value={(formData.menu as any)[dish.key].ingredients}
                      onChange={(v) => {
                        const newMenu = { ...formData.menu };
                        (newMenu as any)[dish.key].ingredients = v;
                        setFormData({...formData, menu: newMenu});
                      }}
                    />
                  </div>
                  <FileInput 
                    label="Dish Photo" 
                    accept="image/*"
                    onChange={(f) => {
                      const newMenu = { ...formData.menu };
                      (newMenu as any)[dish.key].photo = f;
                      setFormData({...formData, menu: newMenu});
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 6: Staffing" />
          <div className="p-8 space-y-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-800 text-sm leading-relaxed">
                FUME Festival requires there to be <strong>at least 6 staff</strong> working on your stand during the 
                live show to maximise speed and quality of service.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Staff Allocation ({formData.staff.length}/{MIN_STAFF_COUNT})</h3>
              <button 
                type="button" 
                onClick={addStaff}
                className="bg-black hover:bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
              >
                + Add Staff
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.staff.map((s, index) => (
                <div key={s.id} className="flex gap-4 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Staff {index + 1} Role</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 outline-none"
                      value={s.role}
                      onChange={(e) => {
                        const newStaff = [...formData.staff];
                        newStaff[index].role = e.target.value;
                        setFormData({...formData, staff: newStaff});
                      }}
                    >
                      {STAFF_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeStaff(s.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <SectionHeader title="Section 7: Final Details" />
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Vehicle Registration Number" 
              placeholder="e.g. AB12 XYZ"
              value={formData.vehicleReg}
              onChange={(v) => setFormData({...formData, vehicleReg: v})}
              required
            />
            <FormField 
              label="Instagram Handle" 
              placeholder="@your_brand"
              value={formData.instagram}
              onChange={(v) => setFormData({...formData, instagram: v})}
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Questions / Comments</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Anything else we should know?"
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="pb-12">
          <button 
            type="submit"
            disabled={isSubmitting || formData.staff.length < MIN_STAFF_COUNT}
            className={`w-full py-5 rounded-2xl text-xl font-bold text-white shadow-2xl transition transform active:scale-95 flex items-center justify-center gap-3 ${
              isSubmitting || formData.staff.length < MIN_STAFF_COUNT 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-700 hover:-translate-y-1'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Updating Sheets...
              </>
            ) : (
              'Submit Final Onboarding Details'
            )}
          </button>
        </div>
      </form>
      
      <footer className="mt-12 text-center text-gray-400 text-xs py-8 border-t border-gray-100">
        &copy; 2025 FUME Festival. Allianz Stadium Events Division.
      </footer>
    </div>
  );
};

export default App;
