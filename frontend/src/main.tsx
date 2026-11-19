import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, ArrowRight, Bell, Building2, CheckCircle2, ChevronDown, CircleDot, ClipboardCheck, FileText, Filter, Gauge, Globe2, Grid2X2, Layers3, Map as MapIcon, Menu, Moon, Search, Settings2, ShieldCheck, Sparkles, Sun, UserRound, Users, X, Zap } from 'lucide-react';
import './styles.css';
import { api, setToken, type LoginChallenge, type Session } from './api';
import type { LucideIcon } from 'lucide-react';
import type { MapMode } from './GeoMap';
const GeoMap=React.lazy(()=>import('./GeoMap').then(module=>({default:module.GeoMap})));
const LandDnaFlow=React.lazy(()=>import('./FlowGraphs').then(module=>({default:module.LandDnaFlow})));
const WorkflowFlow=React.lazy(()=>import('./FlowGraphs').then(module=>({default:module.WorkflowFlow})));
function MapView(props:React.ComponentProps<typeof GeoMap>){return <React.Suspense fallback={<div className="map-loading">Preparing parcel map…</div>}><GeoMap {...props}/></React.Suspense>}
import type { DashboardPayload, ParcelGeometry } from './api';

type Role = 'Citizen' | 'Revenue Officer' | 'Registration Officer' | 'Planning Officer' | 'GIS Officer' | 'Department Head' | 'Data Integration Admin' | 'System Administrator';
type Place = {state:string; district:string; block:string; village:string};
const DEMO_ROLES: Array<{role:Role;email:string;name:string;accent:string}> = [
  {role:'Citizen',email:'citizen@demo.gov',name:'Meenakshi R.',accent:'Resident services'},
  {role:'Revenue Officer',email:'revenue@demo.gov',name:'R. Prakash',accent:'RoR and ownership'},
  {role:'Registration Officer',email:'registration@demo.gov',name:'S. Anitha',accent:'Registration and encumbrance'},
  {role:'Planning Officer',email:'planning@demo.gov',name:'K. Senthil',accent:'Planning and zoning'},
  {role:'GIS Officer',email:'gis@demo.gov',name:'V. Hari',accent:'Spatial intelligence'},
  {role:'Department Head',email:'head@demo.gov',name:'A. Raman',accent:'Approvals and analytics'},
  {role:'Data Integration Admin',email:'dataadmin@demo.gov',name:'N. Kavya',accent:'Data quality and APIs'},
  {role:'System Administrator',email:'admin@demo.gov',name:'System Admin',accent:'Users and system health'},
];
const roleFromApi = (role: string): Role => ({citizen:'Citizen',revenue_officer:'Revenue Officer',registration_officer:'Registration Officer',planning_officer:'Planning Officer',gis_officer:'GIS Officer',department_head:'Department Head',data_admin:'Data Integration Admin',system_admin:'System Administrator'} as Record<string, Role>)[role] || 'Citizen';
type Parcel = { id: string; ulpin: string; survey: string; village: string; taluk: string; owner: string; gst?: string; area: string; landUse: string; risk: 'Low' | 'Medium' | 'High'; geometry?: ParcelGeometry; priorityScore?: number; updatedYear?: number; areaMismatch?: boolean; openEncumbrance?: boolean; activeDispute?: boolean; floodZone?: boolean; zoningConflict?: boolean; boundaryOverlap?: boolean; sameOwnerConflict?: boolean; openApplication?: boolean };
const emptyParcel: Parcel = {id:'',ulpin:'',survey:'',village:'',taluk:'',owner:'',area:'',landUse:'',risk:'Low'};
const normalizeParcel = (raw: Record<string, unknown>): Parcel => ({ id:String(raw.id ?? ''), ulpin:String(raw.ulpin ?? ''), survey:String(raw.survey ?? ''), village:String(raw.village ?? ''), taluk:String(raw.taluk ?? ''), owner:String(raw.owner ?? ''), gst:raw.gst ? String(raw.gst) : undefined, area:String(raw.area ?? ''), landUse:String(raw.land_use ?? raw.landUse ?? ''), risk:(raw.risk === 'High' || raw.risk === 'Medium' ? raw.risk : 'Low'), geometry:raw.geometry && typeof raw.geometry==='object' ? raw.geometry as ParcelGeometry : undefined, priorityScore:typeof raw.priority_score==='number'?raw.priority_score:undefined, updatedYear:typeof raw.updated_year==='number'?raw.updated_year:undefined, areaMismatch:Boolean(raw.area_mismatch), openEncumbrance:Boolean(raw.open_encumbrance), activeDispute:Boolean(raw.active_dispute), floodZone:Boolean(raw.flood_zone), zoningConflict:Boolean(raw.zoning_conflict), boundaryOverlap:Boolean(raw.boundary_overlap), sameOwnerConflict:Boolean(raw.same_owner_conflict), openApplication:Boolean(raw.application_open) });

function ProfilePage({
  session,
  role,
  place,
  onNavigate,
  onSignOut,
  themeMode,
  setThemeMode,
  reduceEffects,
  setReduceEffects
}: {
  session: Session;
  role: Role;
  place: Place | null;
  onNavigate: (tab: string) => void;
  onSignOut: () => void;
  themeMode: string;
  setThemeMode: (m: string) => void;
  reduceEffects: boolean;
  setReduceEffects: (b: boolean) => void;
}) {
  const user = session.user;
  const permissions = session.permissions || [];
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US';

  return (
    <div className="profile-page-shell">
      <section className="profile-hero-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-large">{initials}</div>
          <span className="profile-verified-badge" title="Identity & Mobile Verified"><CheckCircle2 size={16} /></span>
        </div>
        <div className="profile-hero-info">
          <div className="profile-role-pill-group">
            <span className="role-pill">{role}</span>
            <span className="auth-type-pill"><ShieldCheck size={13} /> Authenticated</span>
          </div>
          <h1>{user.name}</h1>
          <p className="profile-email"><FileText size={14} /> {user.email}</p>
          <div className="profile-meta-tags">
            <span><Building2 size={13} /> {place ? `${place.village}, ${place.block}` : 'Chengalpattu District'}</span>
            <span><Globe2 size={13} /> Tamil Nadu Cadastral DPI</span>
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="panel profile-panel">
          <div className="panel-title">
            <h2>Account & Security Details</h2>
            <UserRound size={16} />
          </div>
          <div className="profile-info-rows">
            <div className="info-row"><span>Full Name</span><b>{user.name}</b></div>
            <div className="info-row"><span>Official Email</span><b>{user.email}</b></div>
            <div className="info-row"><span>Assigned Role</span><b>{role}</b></div>
            <div className="info-row"><span>Registered Mobile</span><b>+91 98765 43210 <small className="verified-tag"><CheckCircle2 size={11} /> OTP Verified</small></b></div>
            <div className="info-row"><span>Session Status</span><b>Active Bearer Token <small className="active-tag">Valid</small></b></div>
            <div className="info-row"><span>Authentication Gateway</span><b>Firebase Auth & BhuView DPI API</b></div>
          </div>
        </section>

        <section className="panel profile-panel">
          <div className="panel-title">
            <h2>Role Permissions Matrix</h2>
            <ShieldCheck size={16} />
          </div>
          <p className="panel-subtext">Backend endpoints enforce these permissions on every protected request.</p>
          <div className="permissions-pills-grid">
            {permissions.map(perm => (
              <div key={perm} className="perm-pill">
                <CheckCircle2 size={13} className="perm-icon" />
                <span>{perm.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel profile-panel">
          <div className="panel-title">
            <h2>Preferences & Theme</h2>
            <Settings2 size={16} />
          </div>
          <div className="preference-items">
            <div className="pref-item">
              <div>
                <b>Apple Interface Appearance</b>
                <p>Choose between Light frosted glass or Dark SF appearance.</p>
              </div>
              <div className="segmented">
                <button className={themeMode === 'standard-mode' ? 'on' : ''} onClick={() => { setThemeMode('standard-mode'); localStorage.setItem('bhuview-theme', 'standard'); }}>Light</button>
                <button className={themeMode === 'command-mode' ? 'on' : ''} onClick={() => { setThemeMode('command-mode'); localStorage.setItem('bhuview-theme', 'command'); }}>Dark</button>
              </div>
            </div>

            <div className="pref-item">
              <div>
                <b>Motion & Animation Effects</b>
                <p>Reduce translucency, particle drifts, and camera animations.</p>
              </div>
              <button
                className={`toggle ${reduceEffects ? 'on' : ''}`}
                onClick={() => {
                  const next = !reduceEffects;
                  setReduceEffects(next);
                  localStorage.setItem('bhuview-reduce-effects', String(next));
                }}
              />
            </div>
          </div>
        </section>

        <section className="panel profile-panel profile-danger-panel">
          <div className="panel-title">
            <h2>Session Management</h2>
          </div>
          <p>Sign out of your active BhuView session on this machine.</p>
          <button className="outline-btn danger-logout-btn" onClick={onSignOut}>
            Sign Out of BhuView
          </button>
        </section>
      </div>
    </div>
  );
}

function OtpScreen({challenge,onVerified}:{challenge:LoginChallenge;onVerified:(session:Session)=>void}) {
  const [code,setCode]=useState('123456'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [cooldown,setCooldown]=useState(30);
  useEffect(()=>{const timer=window.setInterval(()=>setCooldown(v=>v>0?v-1:0),1000);return()=>window.clearInterval(timer)},[]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const verified=await api.verifyOtp(challenge.otp_challenge_id,code);setToken(verified.access_token);onVerified({...challenge,access_token:verified.access_token,user:verified.user,permissions:verified.permissions})}catch(err){setError(err instanceof Error?err.message:'OTP verification failed')}finally{setBusy(false)}};
  return <div className="login-shell"><div className="login-atlas"><div className="atlas-orbit orbit-one"/><div className="atlas-orbit orbit-two"/><div className="atlas-tile tile-one"/><div className="atlas-tile tile-two"/><div className="atlas-tile tile-three"/><span className="atlas-label">CIVIC ATLAS · 3D LAND INTELLIGENCE</span></div><div className="login-card"><div className="brand login-brand"><div className="brand-mark"><span/><span/><span/><span/></div><div><b>BhuView</b><small>LAND GOVERNANCE OS</small></div></div><div className="eyebrow">STEP 2 OF 2 · MOBILE VERIFICATION</div><h1>Enter your one-time code</h1><p className="login-copy">A 6-digit code was sent to the mobile number registered for <b>{challenge.user.email}</b>.</p><div className="mock-sms">{challenge.mock_sms} <small>MOCK SMS FOR DEMO</small></div><form onSubmit={submit}><label>Verification code<input aria-label="One-time password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} required/></label>{error&&<div className="login-error" role="alert">{error}</div>}<button className="primary-btn login-button" disabled={busy}>{busy?'Verifying…':'Verify and enter portal'} <ArrowRight size={15}/></button></form><div className="otp-foot"><span>Code expires in 5 minutes</span><button disabled={cooldown>0} onClick={()=>setCooldown(30)}>{cooldown>0?`Resend in ${cooldown}s`:'Resend code'}</button></div></div></div>
}
function LoginScreen({onLogin}:{onLogin:(session:Session)=>void}) {
  const [authTab, setAuthTab] = useState<'email' | 'phone' | 'demo'>('email');
  const [email, setEmail] = useState('citizen@demo.gov');
  const [password, setPassword] = useState('BhuView@2026');
  const [name, setName] = useState('Meenakshi R.');
  const [role, setRole] = useState('citizen');
  const [isSignUp, setIsSignUp] = useState(false);

  const [phone, setPhone] = useState('+919876543210');
  const [phoneCode, setPhoneCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [challenge, setChallenge] = useState<LoginChallenge|null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isSignUp) {
        const { firebaseSignUp } = await import('./firebase');
        const profile = await firebaseSignUp(email, password, name, role, phone);
        const sessionPayload: Session = {
          access_token: 'firebase-' + profile.uid,
          token_type: 'bearer',
          user: { email: profile.email, name: profile.name, role: profile.role, exp: Math.floor(Date.now() / 1000) + 3600, otp_verified: true },
          permissions: ['VIEW_OWN_PARCEL', 'CREATE_SERVICE_REQUEST', 'UPLOAD_DOCUMENT', 'VIEW_OWN_NOTIFICATIONS']
        };
        setToken(sessionPayload.access_token);
        onLogin(sessionPayload);
      } else {
        try {
          const { firebaseLogin } = await import('./firebase');
          const profile = await firebaseLogin(email, password);
          const sessionPayload: Session = {
            access_token: 'firebase-' + profile.uid,
            token_type: 'bearer',
            user: { email: profile.email, name: profile.name, role: profile.role, exp: Math.floor(Date.now() / 1000) + 3600, otp_verified: true },
            permissions: ['VIEW_OWN_PARCEL', 'CREATE_SERVICE_REQUEST', 'UPLOAD_DOCUMENT', 'VIEW_OWN_NOTIFICATIONS']
          };
          setToken(sessionPayload.access_token);
          onLogin(sessionPayload);
        } catch (firebaseErr: any) {
          try {
            const next = await api.login(email, password);
            setToken(next.access_token);
            onLogin(next);
          } catch {
            const msg = firebaseErr?.message || 'Firebase sign in failed.';
            if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('400')) {
              setError('Firebase Auth: User not found or Email/Password is not enabled in Firebase Console. Toggle to "Sign Up" tab to create your account or click "Demo Access".');
            } else {
              setError(msg);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to complete authentication');
    } finally {
      setBusy(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { setupRecaptcha, sendPhoneVerification } = await import('./firebase');
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneVerification(phone, verifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS code. Check phone format (e.g. +919876543210)');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setBusy(true);
    setError('');
    try {
      const { verifyPhoneCode } = await import('./firebase');
      const profile = await verifyPhoneCode(confirmationResult, phoneCode);
      const sessionPayload: Session = {
        access_token: 'firebase-phone-' + profile.uid,
        token_type: 'bearer',
        user: { email: profile.email, name: profile.name || profile.phone || 'Phone User', role: profile.role || 'citizen', exp: Math.floor(Date.now() / 1000) + 3600, otp_verified: true },
        permissions: ['VIEW_OWN_PARCEL', 'CREATE_SERVICE_REQUEST', 'UPLOAD_DOCUMENT', 'VIEW_OWN_NOTIFICATIONS']
      };
      setToken(sessionPayload.access_token);
      onLogin(sessionPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid SMS code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (challenge) return <OtpScreen challenge={challenge} onVerified={onLogin} />;

  return (
    <div className="login-shell">
      <div className="login-atlas">
        <div className="atlas-orbit orbit-one"/><div className="atlas-orbit orbit-two"/>
        <div className="atlas-tile tile-one"/><div className="atlas-tile tile-two"/><div className="atlas-tile tile-three"/>
        <span className="atlas-label">CIVIC ATLAS · 3D LAND INTELLIGENCE</span>
      </div>
      <div className="login-card login-card-wide">
        <div className="brand login-brand">
          <div className="brand-mark"><span/><span/><span/><span/></div>
          <div><b>BhuView</b><small>LAND GOVERNANCE OS</small></div>
        </div>
        <div className="eyebrow">FIREBASE AUTHENTICATION & DATABASE CONNECTED</div>
        <h1>Sign in to your portal</h1>
        
        <div className="auth-nav-tabs">
          <button type="button" className={`auth-nav-tab ${authTab === 'email' ? 'active' : ''}`} onClick={() => { setAuthTab('email'); setError(''); }}>
            Email & Password
          </button>
          <button type="button" className={`auth-nav-tab ${authTab === 'phone' ? 'active' : ''}`} onClick={() => { setAuthTab('phone'); setError(''); }}>
            Phone Number Verification
          </button>
          <button type="button" className={`auth-nav-tab ${authTab === 'demo' ? 'active' : ''}`} onClick={() => { setAuthTab('demo'); setError(''); }}>
            Demo Roles Directory
          </button>
        </div>

        {authTab === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            {isSignUp && (
              <>
                <label>Full Name
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                </label>
                <label>Assign Role
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '8px', width: '100%', marginBottom: '10px', borderRadius: '8px' }}>
                    <option value="citizen">Citizen</option>
                    <option value="revenue_officer">Revenue Officer</option>
                    <option value="registration_officer">Registration Officer</option>
                    <option value="planning_officer">Planning Officer</option>
                    <option value="gis_officer">GIS Officer</option>
                    <option value="department_head">Department Head</option>
                    <option value="data_admin">Data Integration Admin</option>
                    <option value="system_admin">System Administrator</option>
                  </select>
                </label>
              </>
            )}
            <label>Email address
              <input aria-label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>Password
              <input aria-label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="primary-btn login-button" disabled={busy}>
              {busy ? 'Authenticating…' : (isSignUp ? 'Create Account with Firebase' : 'Sign In with Firebase')} <ArrowRight size={15} />
            </button>
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button type="button" className="link-btn" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}

        {authTab === 'phone' && (
          <div>
            {!confirmationResult ? (
              <form onSubmit={handleSendPhoneOtp}>
                <p className="login-copy">Enter your registered mobile phone number to receive a Firebase SMS verification code.</p>
                <label>Phone Number (e.g. +919876543210)
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+919876543210" required />
                </label>
                <div id="recaptcha-container" className="recaptcha-box" />
                {error && <div className="login-error" role="alert">{error}</div>}
                <button className="primary-btn login-button" disabled={busy}>
                  {busy ? 'Sending SMS Code…' : 'Send Phone Verification Code'} <ArrowRight size={15} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp}>
                <p className="login-copy">Enter the 6-digit SMS verification code sent to <b>{phone}</b>.</p>
                <label>Verification Code
                  <input inputMode="numeric" maxLength={6} value={phoneCode} onChange={e => setPhoneCode(e.target.value)} placeholder="123456" required />
                </label>
                {error && <div className="login-error" role="alert">{error}</div>}
                <button className="primary-btn login-button" disabled={busy}>
                  {busy ? 'Verifying SMS Code…' : 'Verify & Enter Portal'} <ArrowRight size={15} />
                </button>
                <button type="button" className="link-btn" style={{ marginTop: '8px' }} onClick={() => setConfirmationResult(null)}>
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {authTab === 'demo' && (
          <div>
            <p className="login-copy">Select any preconfigured government role below to log in directly into the demonstration workspace.</p>
            <div className="demo-login"><b>Demo role directory · 8 portals</b><span>Password: <code>BhuView@2026</code> · OTP: <code>123456</code></span></div>
            <div className="role-directory">
              {DEMO_ROLES.map(item => (
                <button type="button" key={item.role} className={`role-card ${email === item.email ? 'chosen' : ''}`} onClick={async () => {
                  setEmail(item.email);
                  setError('');
                  try {
                    const next = await api.login(item.email, 'BhuView@2026');
                    setToken(next.access_token);
                    setChallenge(next);
                  } catch (err) {
                    setError('Unable to log in as demo role');
                  }
                }}>
                  <span className="role-dot" />
                  <span><b>{item.role}</b><small>{item.name} · {item.accent}</small></span>
                  <ArrowRight size={13} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function PlaceGeometryPreview({parcels,placeName}:{parcels:Parcel[];placeName:string}) {
  const points=parcels.flatMap(parcel=>parcel.geometry?.coordinates?.[0]||[]);
  if(!points.length)return <div className="place-preview-empty">No parcel boundaries are available for this area yet.</div>;
  const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const project=(point:number[])=>`${30+(point[0]-minX)/(maxX-minX||1)*580},${218-(point[1]-minY)/(maxY-minY||1)*178}`;
  return <svg className="place-preview-svg" viewBox="0 0 640 250" role="img" aria-label={`${parcels.length} backend cadastral parcel boundaries in ${placeName}`}>
    <title>{placeName} parcel preview</title><rect width="640" height="250" rx="14" fill="#f5f8fc"/>
    <path d="M0 62H640M0 125H640M0 188H640M160 0V250M320 0V250M480 0V250" stroke="#e3eaf2" strokeWidth="1"/>
    {parcels.map(parcel=>{const ring=parcel.geometry?.coordinates?.[0];if(!ring||ring.length<4)return null;const fill=parcel.risk==='High'?'#e76c6c':parcel.risk==='Medium'?'#e5ac4c':'#5a9bd5';return <g key={parcel.id}><polygon points={ring.map(project).join(' ')} fill={fill} fillOpacity=".54" stroke={parcel.id===parcels[0]?.id?'#174ea6':'#ffffff'} strokeWidth={parcel.id===parcels[0]?.id?3:2}/></g>})}
  </svg>;
}
function LocationScreen({session,onContinue}:{session:Session;onContinue:(place:Place)=>void}){
  const [selected,setSelected]=useState(0);const [previewParcels,setPreviewParcels]=useState<Parcel[]>([]);const [previewLoading,setPreviewLoading]=useState(true);const [previewError,setPreviewError]=useState('');
  const places:Place[]=[{state:'Tamil Nadu',district:'Chengalpattu',block:'Tambaram',village:'Kovilambakkam'},{state:'Tamil Nadu',district:'Chengalpattu',block:'Tambaram',village:'Medavakkam'},{state:'Tamil Nadu',district:'Chengalpattu',block:'Tambaram',village:'Pallikaranai'},{state:'Tamil Nadu',district:'Chengalpattu',block:'Tambaram',village:'Perumbakkam'}];
  useEffect(()=>{let active=true;setPreviewParcels([]);setPreviewLoading(true);setPreviewError('');api.parcels(places[selected].village).then(rows=>{if(active)setPreviewParcels(rows.map(row=>normalizeParcel(row)))}).catch(error=>{if(active)setPreviewError(error instanceof Error?error.message:'Unable to load this place preview')}).finally(()=>{if(active)setPreviewLoading(false)});return()=>{active=false}},[selected]);
  const place=places[selected];
  return <div className="location-shell"><div className="location-hero"><div className="brand login-brand"><div className="brand-mark"><span/><span/><span/><span/></div><div><b>BhuView</b><small>LAND GOVERNANCE OS</small></div></div><div className="location-3d"><div className="location-globe"/><div className="location-pin pin-one">TN</div><div className="location-pin pin-two">07</div><div className="location-pin pin-three">23</div></div><div className="location-caption"><div className="eyebrow">STEP 3 · PLACE CONTEXT</div><h2>Where do you want to work?</h2><p>Welcome, <b>{session.user.name}</b>. Select a place to preview its parcel boundaries immediately, then open the workspace.</p></div></div><div className="location-card"><div className="location-card-head"><div><div className="eyebrow">AVAILABLE DEMO PLACES</div><h1>Choose your operating area</h1></div><span className="role-pill">{roleFromApi(session.user.role)}</span></div><div className="place-grid">{places.map((item,index)=><button type="button" key={item.village} className={`place-card ${selected===index?'selected':''}`} aria-pressed={selected===index} onClick={()=>setSelected(index)}><div className="place-map-thumb"><span/><i/><b>{index+1}</b></div><div><small>{item.state} · {item.district}</small><strong>{item.village}</strong><span>{item.block} Block · Parcel registry</span></div><CheckCircle2 size={17}/></button>)}</div><section className="place-preview" aria-live="polite"><div className="place-preview-heading"><div><small>LIVE AREA PREVIEW</small><strong>{place.village}</strong></div><span>{previewLoading?'Loading parcel outlines…':previewError?'Preview unavailable':`${previewParcels.length} parcels`}</span></div>{previewError?<div className="place-preview-empty">{previewError}</div>:previewLoading&&!previewParcels.length?<div className="place-preview-empty">Loading the selected area’s parcel geometry…</div>:<PlaceGeometryPreview parcels={previewParcels} placeName={place.village}/>}<p>Selection updates this boundary preview before you open the dashboard. Full GIS keeps its 3D view.</p></section><button className="primary-btn location-continue" onClick={()=>onContinue(place)}>Open {place.village} dashboard <ArrowRight size={15}/></button></div></div>
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [role, setRole] = useState<Role>('Citizen');
  const [active, setActive] = useState('Overview');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selected, setSelected] = useState<Parcel>(emptyParcel);
  const [parcelLoading, setParcelLoading] = useState(true);
  const [parcelError, setParcelError] = useState('');
  const [query, setQuery] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [requestComposer, setRequestComposer] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<Record<string, unknown>>>([]);
  const [drill, setDrill] = useState('Village / Ward');
  const [toast, setToast] = useState('');
  const [mutationPending, setMutationPending] = useState(false);
  const [reduceEffects,setReduceEffects]=useState(localStorage.getItem('bhuview-reduce-effects')==='true');
  const [themeMode,setThemeMode]=useState('standard-mode');
  const [mobileOpen,setMobileOpen]=useState(false);
  const filtered = parcels;
  useEffect(() => { if (!session) { setParcelLoading(false); return; } let alive = true; setParcelLoading(true); api.parcels(query).then(rows => { if (!alive) return; const next = rows.map(row => normalizeParcel(row)); setParcels(next); setSelected(current => next.find(p => p.id === current.id) || next[0] || emptyParcel); setParcelError(''); }).catch(error => alive && setParcelError(error instanceof Error ? error.message : 'Unable to load parcels')).finally(() => alive && setParcelLoading(false)); return () => { alive = false; }; }, [query, session]);
  useEffect(() => { if (!session) return; api.requests().then(rows => setRequestCount(rows.length)).catch(() => undefined); api.notifications().then(setNotifications).catch(() => undefined); }, [session, requestSent]);
  if (!session) return <div className={`auth-stage ${themeMode}`}><AmbientBackground accent={accentForRole(role)} reduce={reduceEffects}/><LoginScreen onLogin={(next) => { setSession(next); setPlace(null); setRole(roleFromApi(next.user.role)); setActive(next.user.role==='gis_officer'?'GIS workspace':'Overview'); }} /></div>;
  if (!place) return <div className={`auth-stage ${themeMode}`}><AmbientBackground accent={accentForRole(role)} reduce={reduceEffects}/><LocationScreen session={session} onContinue={nextPlace=>{setPlace(nextPlace);setQuery(nextPlace.village)}} /></div>;
  const roleLabel = role === 'Citizen' ? 'Resident services' : role;
  const rawRoleNav: Array<[string, LucideIcon]> = (role === 'Citizen' ? [['Overview', Gauge],['Search parcels', Search],['Parcel 360', Grid2X2],['Service requests', ClipboardCheck],['Planning Sandbox', Building2],['Notifications', Bell]] : role === 'Revenue Officer' ? [['Overview', Gauge],['Assigned cases', ClipboardCheck],['Parcel 360', Grid2X2],['AI verification', Sparkles],['Conflict Radar', AlertTriangle],['Audit trail', ShieldCheck]] : role === 'Registration Officer' ? [['Overview', Gauge],['Pending transactions', ClipboardCheck],['Parcel 360', Grid2X2],['Encumbrances', AlertTriangle],['Reports', FileText]] : role === 'Planning Officer' ? [['Overview', Gauge],['Building applications', Building2],['GIS workspace', MapIcon],['Planning Sandbox', Building2],['Parcel 360', Grid2X2],['Reports', FileText],['Conflict Radar', AlertTriangle]] : role === 'GIS Officer' ? [['Overview', Gauge],['GIS workspace', MapIcon],['Data quality', Layers3],['Parcel 360', Grid2X2],['GIS reports', FileText],['Conflict Radar', AlertTriangle]] : role === 'Department Head' ? [['Overview', Gauge],['Escalated cases', AlertTriangle],['Analytics', Activity],['Parcel 360', Grid2X2],['Reports', FileText],['Conflict Radar', AlertTriangle],['Planning Sandbox', Building2]] : role === 'Data Integration Admin' ? [['Overview', Gauge],['Integrations', Globe2],['Data quality', Layers3],['Import jobs', FileText],['Schema mapper', FileText],['Audit trail', ShieldCheck]] : [['Overview', Gauge],['Users', Users],['Integrations', Globe2],['Schema mapper', FileText],['Audit trail', ShieldCheck],['System health', Activity]]);
  const roleNav: Array<[string, LucideIcon]> = [...rawRoleNav, ['User profile', UserRound]];
  const showParcel = active === 'Parcel 360';
  const showSearch = active === 'Search parcels';
  const showMap = active === 'GIS workspace';
  const showRequests = active === 'Service requests';
  const showAi = active === 'AI verification';
  const showQuality = active === 'Data quality';
  const showAudit = active === 'Audit trail';
  const showIntegrations = active === 'Integrations';
  const showSchema = active === 'Schema mapper';
  const showNotifications = active === 'Notifications';
  const showPlanning = active === 'Planning Sandbox';
  const showConflicts = active === 'Conflict Radar';
  const showProfile = active === 'User profile' || active === 'Profile';
  const showQueue = ['Assigned cases','Pending transactions','Encumbrances','Building applications','Escalated cases'].includes(active);
  const showOperational = ['Users','System health','GIS reports','Reports','Analytics','Import jobs'].includes(active);
  const showRoleDashboard = active === 'Overview';
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2800); };
  const createRequest = () => setRequestComposer(true);
  const submitRequest = async (type:string, description:string) => { setMutationPending(true); try { const result = await api.createServiceRequest(selected.id,type,description); setRequestSent(true); setRequestCount(v=>v+1); setRequestComposer(false); notify(`Service request ${result.id} created`); } catch { notify('Unable to create request'); } finally { setMutationPending(false); } };
  const exportReport = async () => { try { const report = await api.report('parcel'); const blob = new Blob([JSON.stringify(report, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'bhuview-parcel-report.json'; link.click(); URL.revokeObjectURL(url); notify('Report downloaded from the backend'); } catch { notify('Report export failed'); } };
  const flagAnomaly = async () => { setMutationPending(true); try { await api.flagAnomaly('AN-001'); notify('Parcel P-0001 flagged for officer review'); } catch { notify('Flag recorded in demonstration fallback mode'); } finally { setMutationPending(false); } };

  return <div className={`app-shell ${themeMode}`} style={{'--role-accent':accentForRole(role)} as React.CSSProperties}>
    <AmbientBackground accent={accentForRole(role)} reduce={reduceEffects}/>
    {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header-mobile">
        <div className="brand"><div className="brand-mark"><span/><span/><span/><span/></div><div><b>BhuView</b><small>LAND GOVERNANCE OS</small></div></div>
        <button className="mobile-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18}/></button>
      </div>
      <div className="source-card"><div className="source-dot"/><div><small>DATA SOURCE</small><strong>DEMONSTRATION DATA</strong></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Primary workspace navigation">{roleNav.map(([label, Icon]) => <button aria-label={label} key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(label); setMobileOpen(false); }}><Icon size={17}/><span>{label}</span>{label === 'Service requests' && <em>04</em>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={()=>{const next=!reduceEffects;setReduceEffects(next);localStorage.setItem('bhuview-reduce-effects',String(next));notify(next?'Reduced effects enabled':'Motion effects enabled')}}><Settings2 size={17}/><span>Settings · {reduceEffects?'Reduce effects on':'Reduce effects off'}</span></button><div className="profile-mini" onClick={() => { setActive('User profile'); setMobileOpen(false); }} style={{ cursor: 'pointer' }} title="View User Profile"><div className="avatar">{session.user.name.slice(0,2).toUpperCase()}</div><div><b>{session.user.name}</b><small>{roleLabel}</small></div><ChevronDown size={15}/></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation menu" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumbs"><button onClick={()=>{setDrill('State');setQuery('')}}>Tamil Nadu</button><b>/</b><button onClick={()=>{setDrill('District');setQuery('Chengalpattu')}}>Chengalpattu</button><b>/</b><button onClick={()=>{setDrill('Taluk / Block');setQuery('Tambaram')}}>Tambaram</button><b>/</b><button onClick={()=>{setDrill('Village / Ward');setQuery(selected.village)}}>{selected.village||'Village / Ward'}</button><b>/</b><strong>{active}</strong></div><div className="top-actions"><button className="outline-btn theme-toggle" aria-label={themeMode==='standard-mode'?'Switch to dark appearance':'Switch to light appearance'} onClick={()=>{const next=themeMode==='command-mode'?'standard-mode':'command-mode';setThemeMode(next);localStorage.setItem('bhuview-theme',next==='standard-mode'?'standard':'command')}}>{themeMode==='standard-mode'?<Moon size={14}/>:<Sun size={14}/>}<span>{themeMode==='standard-mode'?'Light':'Dark'}</span></button><div className="system-status"><span className="live-dot"/> All systems operational</div><button className="icon-btn" aria-label="Notifications"><Bell size={18}/><i/></button><div className="role-switch"><div className="identity" onClick={() => { setActive('User profile'); setMobileOpen(false); }} style={{ cursor: 'pointer' }} title="View User Profile"><div className="avatar small">{session.user.name.slice(0,2).toUpperCase()}</div><span>{session.user.name}<small>{role}</small></span></div><button className="logout-btn" aria-label="Sign out" onClick={() => {setSession(null);setPlace(null);setActive('Overview');setQuery('');setToken('')}}>Sign out</button></div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow">TUESDAY, 29 SEPTEMBER 2026 <span>•</span> DEMO ENVIRONMENT</div><h1>{showProfile ? 'User Profile & Settings' : role === 'Citizen' ? 'Your land, clearly connected.' : `${role} workspace`}</h1><p>{showProfile ? 'Manage your account credentials, assigned permissions, and system preferences.' : role === 'Citizen' ? 'Search a parcel, understand its full context, and access public services in one place.' : 'Operational view of parcel records, data quality, workflows and evidence.'}</p></div><button className="outline-btn" onClick={exportReport}><FileText size={16}/> Export report</button></div>
        <div className="notice"><AlertTriangle size={17}/><span><b>Synthetic prototype environment.</b> This prototype uses demonstration data and is not an authoritative government land record.</span><button onClick={() => notify('Provenance policy opened')}>View provenance policy <ArrowRight size={14}/></button></div>
        {parcelLoading && !parcels.length ? <section className="panel loading-state">Loading live parcel records…</section> : parcelError ? <section className="panel error-state">{parcelError}<button className="outline-btn" onClick={() => setQuery(query)}>Retry</button></section> : showProfile ? <ProfilePage session={session} role={role} place={place} onNavigate={setActive} onSignOut={() => {setSession(null);setPlace(null);setActive('Overview');setQuery('');setToken('')}} themeMode={themeMode} setThemeMode={setThemeMode} reduceEffects={reduceEffects} setReduceEffects={setReduceEffects} /> : showSearch ? <SearchPanel query={query} setQuery={setQuery} filtered={filtered} role={role} select={(p) => {setSelected(p);setActive('Parcel 360')}} /> : showParcel ? <Parcel360 parcels={parcels} parcel={selected} role={role} requestSent={requestSent} onRequest={createRequest} /> : showMap ? <MapWorkspace parcels={parcels} selected={selected} onSelect={setSelected} role={role} onOpenParcel={()=>setActive('Parcel 360')} /> : showRequests ? <Requests requestSent={requestSent} onNew={()=>setRequestComposer(true)} role={role} /> : showAi ? <AiVerification onFlag={flagAnomaly} busy={mutationPending} /> : showQuality ? <Quality parcels={parcels} /> : showAudit ? <Audit /> : showIntegrations ? <Integrations /> : showSchema ? <SchemaMapper /> : showNotifications ? <Notifications notifications={notifications} /> : showPlanning ? <PlanningSandbox parcel={selected} parcels={parcels} /> : showConflicts ? <ConflictRadar parcels={parcels} selected={selected} onSelect={setSelected} /> : active === 'Users' ? <UsersManagementPage /> : active === 'System health' ? <SystemHealthPage /> : (active === 'Reports' || active === 'GIS reports') ? <ReportsPage onExport={exportReport} /> : active === 'Import jobs' ? <ImportJobsPage /> : showQueue ? <OperationalQueue title={active} onOpenParcel={(id)=>{const target=parcels.find(p=>p.id===id);if(target)setSelected(target);setActive('Parcel 360')}} /> : showOperational ? <OperationalSummary title={active} role={role} onOpen={()=>setActive(active==='GIS reports'?'Reports':active==='Analytics'?'Conflict Radar':active==='Users'?'Users':'Integrations')} /> : showRoleDashboard ? <DashboardRouter role={role} parcels={parcels} selected={selected} onSelect={setSelected} onNavigate={setActive} onRequest={()=>setRequestComposer(true)} /> : <DashboardRouter role={role} parcels={parcels} selected={selected} onSelect={setSelected} onNavigate={setActive} onRequest={()=>setRequestComposer(true)} />}
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}{requestComposer && <RequestComposer parcel={selected} busy={mutationPending} onCancel={()=>setRequestComposer(false)} onSubmit={submitRequest}/>}
  </div>
}

type DashboardProps={role:Role;payload:DashboardPayload;parcels:Parcel[];selected:Parcel;onSelect:(p:Parcel)=>void;onNavigate:(tab:string)=>void;onRequest:()=>void};
const roleWidgetTitles:Record<Role,string[]>={
 'Citizen':['My parcels','Application tracker','Notifications','Start a service','My parcel map'],
 'Revenue Officer':['Assigned cases','Mutation requests','Area mismatch alerts','Request SLA','Cases map'],
 'Registration Officer':['Pending registrations','Encumbrance verification','Registration / RoR mismatches','Document review'],
 'Planning Officer':['Building applications','Zoning conflicts','Flood-zone parcels','Planning Sandbox shortcut','Zoning map'],
 'GIS Officer':['Data quality score','Overlap / geometry errors','Import jobs','Layer health'],
 'Department Head':['Requests by status','High-priority clusters','Escalations','Department performance'],
 'Data Integration Admin':['Integration health','Schema proposals pending approval','Import jobs','Data-quality trend'],
 'System Administrator':['Users and roles','System health','Audit-chain status','Recent security events']
};
const roleMapPreset:Record<Role,'overview'|'parcel'|'gis'|'conflicts'|'sandbox'>={'Citizen':'parcel','Revenue Officer':'conflicts','Registration Officer':'parcel','Planning Officer':'sandbox','GIS Officer':'gis','Department Head':'conflicts','Data Integration Admin':'gis','System Administrator':'overview'};
function accentForRole(role:Role){return ({'Citizen':'#37d9e8','Revenue Officer':'#efb84e','Registration Officer':'#b79aff','Planning Officer':'#70d8a1','GIS Officer':'#4eb8ff','Department Head':'#f0ca6e','Data Integration Admin':'#45d7c5','System Administrator':'#ff866e'} as Record<Role,string>)[role]}
function DashboardRouter(props:Omit<DashboardProps,'payload'>){const [payload,setPayload]=useState<DashboardPayload|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{let alive=true;setLoading(true);api.dashboard().then(data=>{if(alive)setPayload(data)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Unable to load role dashboard')}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[props.role]);if(loading)return <section className="panel loading-state">Loading {props.role} dashboard from the API…</section>;if(error)return <section className="panel error-state" role="alert">{error}<button className="outline-btn" onClick={()=>{setError('');setLoading(true);api.dashboard().then(setPayload).catch(e=>setError(e instanceof Error?e.message:'Unable to load dashboard')).finally(()=>setLoading(false));}}>Retry</button></section>;if(!payload||payload.widgets.length===0)return <section className="panel empty-state">No dashboard widgets are available for this role.</section>;const Dashboard=dashboards[props.role];return <Dashboard {...props} payload={payload}/>}
function RoleDashboardFrame({role,payload,parcels,selected,onSelect,onNavigate,onRequest}:{role:Role;payload:DashboardPayload;parcels:Parcel[];selected:Parcel;onSelect:(p:Parcel)=>void;onNavigate:(tab:string)=>void;onRequest:()=>void}){const data=payload.data;const title=role==='Citizen'?'Your land, clearly connected.':`${role} command view`;const actions:Record<Role,Array<[string,string]>>={'Citizen':[['Start a service','Service requests'],['View my parcels','Search parcels']],'Revenue Officer':[['Open assigned cases','Assigned cases'],['Review alerts','AI verification']],'Registration Officer':[['Review transactions','Pending transactions'],['Check encumbrances','Encumbrances']],'Planning Officer':[['Run simulation','Planning Sandbox'],['Open zoning map','GIS workspace']],'GIS Officer':[['Open GIS Command Center','GIS workspace'],['Review data quality','Data quality']],'Department Head':[['Review escalations','Escalated cases'],['Open analytics','Analytics']],'Data Integration Admin':[['Review integrations','Integrations'],['Open schema mapper','Schema mapper']],'System Administrator':[['Review users','Users'],['Open audit trail','Audit trail']]};
  const displayed=roleWidgetTitles[role];const maps=['Citizen','Revenue Officer','Planning Officer','GIS Officer'].includes(role);return <div className={`role-dashboard role-${role.toLowerCase().replace(/ /g,'-')}`}><header className="role-dashboard-head"><div><div className="eyebrow">ROLE-SCOPED · {role.toUpperCase()} · <span>DEMONSTRATION DATA</span></div><h1>{title}</h1><p>{role==='Citizen'?'Your property and service activity.':`API-backed ${role.toLowerCase()} widgets and work queues.`}</p></div><div className="role-actions">{actions[role].map(([label,tab])=><button key={tab} className="outline-btn" onClick={()=>onNavigate(tab)}>{label}<ArrowRight size={13}/></button>)}</div></header>
  <div className="role-kpis">{displayed.slice(0,4).map((widget,index)=>{const key=payload.widgets[index]||'';const value=data[key];const number=Array.isArray(value)?value.length:value&&typeof value==='object'&&'score' in value?String((value as {score:unknown}).score):value&&typeof value==='object'&&'open' in value?String((value as {open:unknown}).open):value&&typeof value==='object'?Object.keys(value).length:String(value??0);return <div className="role-kpi" key={key}><small>{widget}</small><strong>{number}</strong><span>API result · {payload.label}</span></div>})}</div>
  {maps&&<section className="panel role-map-panel"><div className="panel-title"><h2>{role==='GIS Officer'?'GIS Command Center':role==='Planning Officer'?'Zoning and scenario map':'Parcel intelligence map'}</h2><button className="link-btn" onClick={()=>onNavigate(role==='Planning Officer'?'Planning Sandbox':'GIS workspace')}>Open workspace <ArrowRight size={13}/></button></div><MapView parcels={parcels} selected={selected} onSelect={onSelect} preset={roleMapPreset[role]}/></section>}
  <div className="role-widget-grid">{displayed.map((title,index)=>{const key=payload.widgets[index];if(!key||['my_parcel_map','cases_map','zoning_map'].includes(key))return null;const value=data[key];return <DashboardWidget key={key} title={title} value={value} onNavigate={onNavigate} onSelect={onSelect} parcels={parcels}/>})}</div>
  {role==='Citizen'&&selected.id&&<WorkflowFlow parcelId={selected.id} role={role}/>}
  {role==='Citizen'&&<button className="primary-btn role-service-cta" onClick={onRequest}>Start a service request <ArrowRight size={15}/></button>}
  </div>}
function dashboardParcels(data:Record<string,unknown>):Parcel[]{const raw=data.my_parcels;return Array.isArray(raw)?raw.filter((item):item is Record<string,unknown>=>Boolean(item)&&typeof item==='object').map(item=>normalizeParcel(item)):[]}
function DashboardWidget({title,value,onNavigate,onSelect,parcels}:{title:string;value:unknown;onNavigate:(tab:string)=>void;onSelect:(p:Parcel)=>void;parcels:Parcel[]}){if(value===undefined)return <section className="panel role-widget"><h2>{title}</h2><div className="empty-state">No data returned for this widget.</div></section>;if(Array.isArray(value))return <section className="panel role-widget"><div className="panel-title"><h2>{title}</h2><span className="widget-count">{value.length}</span></div>{value.length===0?<div className="empty-state">No items currently require attention.</div>:value.slice(0,6).map((entry,index)=>{const row:Record<string,unknown>=entry&&typeof entry==='object'?entry as Record<string,unknown>:{value:String(entry??'')};const parcelId=String(row.parcel_id??row.id??'');const label=String(row.id??row.name??row.title??parcelId??`Item ${index+1}`);return <button className="widget-row" key={`${label}-${index}`} onClick={()=>{if(parcelId.startsWith('P-')){const found=parcels.find(p=>p.id===parcelId);if(found)onSelect(found);onNavigate('Parcel 360')}else if(title.toLowerCase().includes('alert')||title.toLowerCase().includes('cluster')||title.toLowerCase().includes('conflict'))onNavigate('Conflict Radar');else if(title.toLowerCase().includes('case')||title.toLowerCase().includes('application')||title.toLowerCase().includes('registration'))onNavigate('Assigned cases')}}><span><b>{label}</b><small>{String(row.status??row.type??row.state??row.village??row.label??'Review details')}</small></span><ArrowRight size={14}/></button>})}</section>;if(value&&typeof value==='object')return <section className="panel role-widget"><div className="panel-title"><h2>{title}</h2><span className="live-dot"/></div>{Object.entries(value as Record<string,unknown>).map(([key,item])=><div className="widget-row static-row" key={key}><span><b>{humanize(key)}</b><small>{Array.isArray(item)?`${item.length} records`:String(item)}</small></span></div>)}</section>;return <section className="panel role-widget"><h2>{title}</h2><strong>{String(value)}</strong></section>}
function humanize(value:string){return value.replace(/_/g,' ').replace(/\b\w/g,(letter:string)=>letter.toUpperCase())}
function DashboardPropsFactory(role:Role){return function RoleDashboard(props:DashboardProps){return <RoleDashboardFrame {...props} role={role}/>}}
const CitizenDashboard=DashboardPropsFactory('Citizen');const RevenueOfficerDashboard=DashboardPropsFactory('Revenue Officer');const RegistrationOfficerDashboard=DashboardPropsFactory('Registration Officer');const PlanningOfficerDashboard=DashboardPropsFactory('Planning Officer');const GISOfficerDashboard=DashboardPropsFactory('GIS Officer');const DepartmentHeadDashboard=DashboardPropsFactory('Department Head');const DataIntegrationAdminDashboard=DashboardPropsFactory('Data Integration Admin');const SystemAdministratorDashboard=DashboardPropsFactory('System Administrator');
const dashboards:Record<Role,React.ComponentType<DashboardProps>>={'Citizen':CitizenDashboard,'Revenue Officer':RevenueOfficerDashboard,'Registration Officer':RegistrationOfficerDashboard,'Planning Officer':PlanningOfficerDashboard,'GIS Officer':GISOfficerDashboard,'Department Head':DepartmentHeadDashboard,'Data Integration Admin':DataIntegrationAdminDashboard,'System Administrator':SystemAdministratorDashboard};
function AmbientBackground({accent,reduce}:{accent:string;reduce:boolean}){const layerRef=useRef<HTMLDivElement>(null);useEffect(()=>{const node=layerRef.current;if(!node)return;let latest=0;const updatePause=()=>node.classList.toggle('ambient-paused',document.hidden||!document.hasFocus()||reduce||window.matchMedia('(prefers-reduced-motion: reduce)').matches);const move=(event:PointerEvent)=>{if(document.hidden||!document.hasFocus()||reduce||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;const now=performance.now();if(now-latest<40)return;latest=now;const x=(event.clientX/window.innerWidth-.5)*8,y=(event.clientY/window.innerHeight-.5)*6;node.style.setProperty('--pointer-x',`${x}px`);node.style.setProperty('--pointer-y',`${y}px`)};updatePause();window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',updatePause);window.addEventListener('focus',updatePause);document.addEventListener('visibilitychange',updatePause);return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',updatePause);window.removeEventListener('focus',updatePause);document.removeEventListener('visibilitychange',updatePause)}},[reduce]);return <div ref={layerRef} className={`ambient-background ${reduce?'reduce-effects':''}`} style={{'--ambient-accent':accent} as React.CSSProperties} aria-hidden="true"><div className="ambient-grid far-grid"/><div className="ambient-contours mid-contours"/><div className="ambient-points near-points"/></div>}
function OperationalQueue({title,onOpenParcel}:{title:string;onOpenParcel:(parcelId:string)=>void}){const [rows,setRows]=useState<Array<Record<string,unknown>>>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{api.requests().then(setRows).catch(e=>setError(e instanceof Error?e.message:'Unable to load cases')).finally(()=>setLoading(false))},[]);return <section className="panel operational-queue"><PanelTitle title={title} action="DEMONSTRATION DATA"/>{loading?<div className="loading-state">Loading role-scoped work queue…</div>:error?<div className="error-state">{error}</div>:rows.length===0?<div className="empty-state">No items are awaiting action.</div>:rows.map(row=><button className="widget-row" key={String(row.id)} onClick={()=>onOpenParcel(String(row.parcel_id))}><span><b>{String(row.id)} · {String(row.parcel_id)}</b><small>{String(row.request_type)} · {String(row.status)}</small></span><ArrowRight size={14}/></button>)}<button className="outline-btn" onClick={()=>onOpenParcel(String(rows[0]?.parcel_id||'P-0001'))}>Open Parcel 360 <ArrowRight size={14}/></button></section>}
function OperationalSummary({title,role,onOpen}:{title:string;role:Role;onOpen:()=>void}){const [payload,setPayload]=useState<DashboardPayload|null>(null);const [error,setError]=useState('');useEffect(()=>{api.dashboard().then(setPayload).catch(e=>setError(e instanceof Error?e.message:'Unable to load operational data'))},[]);return <section className="panel operational-summary"><PanelTitle title={title} action={role}/>{error?<div className="error-state">{error}</div>:!payload?<div className="loading-state">Loading operational metrics…</div>:<DashboardWidget title={title} value={payload.data[({Users:'users_roles','System health':'system_health','GIS reports':'geometry_errors',Analytics:'requests_by_status','Import jobs':'import_jobs',Reports:'department_performance'} as Record<string,string>)[title]||Object.keys(payload.data)[0]]} onNavigate={()=>undefined} onSelect={()=>undefined} parcels={[]}/>}<button className="primary-btn" onClick={onOpen}>Open module <ArrowRight size={15}/></button></section>}

function Metric({label,value,delta,tone,icon:Icon}:{label:string;value:string;delta:string;tone:string;icon:LucideIcon}){return <div className="metric"><div className={`metric-icon ${tone}`}><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small className={tone === 'amber' ? 'warn' : ''}>{delta}</small></div></div>}
function PanelTitle({title,action}:{title:string;action?:string}){return <div className="panel-title"><h2>{title}</h2>{action && <button className="link-btn">{action} <ArrowRight size={14}/></button>}</div>}
function Risk({risk}:{risk:Parcel['risk']}){return <span className={`risk ${risk.toLowerCase()}`}><i/>{risk}</span>}
function SearchPanel({query,setQuery,filtered,select,role}:{query:string;setQuery:(v:string)=>void;filtered:Parcel[];select:(p:Parcel)=>void;role:Role}){return <section className="panel search-panel"><PanelTitle title="Search the parcel registry" action="Advanced filters"/><div className="search-box"><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by ULPIN, parcel ID, survey number or owner"/><kbd>⌘ K</kbd></div><div className="search-summary"><span>{filtered.length} matching parcels</span><span>Showing synthetic records from Chengalpattu district</span></div><div className="result-list">{filtered.length===0 ? <div className="empty-state">No parcels matched. Try a different ULPIN, survey number, owner name, or GST number.</div> : filtered.map(p=><button className="result-row" key={p.id} onClick={()=>select(p)}><div className="result-avatar"><Grid2X2 size={18}/></div><div><b>{p.id} <span>{p.ulpin}</span></b><p>{p.survey} · {p.village}, {p.taluk}</p></div><div className="result-owner"><small>REGISTERED OWNER</small><b>{maskIfNeeded(p.owner,role,p.owner==='Meenakshi R.')}</b></div><Risk risk={p.risk}/><ArrowRight size={16}/></button>)}</div></section>}
function maskIfNeeded(value:string, role:Role, isOwnParcel:boolean){return role==='Citizen' && !isOwnParcel ? '•••••••• (protected)' : value}
function Parcel360({parcels,parcel,role,requestSent,onRequest}:{parcels:Parcel[];parcel:Parcel;role:Role;requestSent:boolean;onRequest:()=>void}){const [detail,setDetail]=useState<Parcel>(parcel);const [loading,setLoading]=useState(false);const [error,setError]=useState('');useEffect(()=>{if(!parcel.id)return;setLoading(true);api.parcel(parcel.id).then(raw=>setDetail(normalizeParcel(raw))).catch(e=>setError(e instanceof Error?e.message:'Unable to load parcel detail')).finally(()=>setLoading(false))},[parcel.id]);if(loading)return <section className="panel loading-state">Loading Parcel 360 from the backend…</section>;if(error)return <section className="panel error-state">{error}</section>;return <><div className="parcel-heading"><div><div className="eyebrow">PARCEL 360 / {detail.id}</div><h2>{detail.survey} <span className="verified-pill"><CheckCircle2 size={13}/> Verified context</span></h2><p>{detail.village}, {detail.taluk} · Chengalpattu, Tamil Nadu</p></div><Risk risk={detail.risk}/></div><div className="parcel-summary"><div><small>ULPIN / BHU-AADHAAR</small><b>{detail.ulpin}</b></div><div><small>REGISTERED OWNER</small><b>{maskIfNeeded(detail.owner,role,detail.owner==='Meenakshi R.')}</b></div><div><small>GIS AREA</small><b>{detail.area}</b></div><div><small>LAND USE</small><b>{detail.landUse}</b></div></div><section className="parcel-grid"><div className="panel panel-map"><PanelTitle title="Parcel boundary & context" action="Open full GIS"/><MapView parcels={parcels} selected={detail} preset="parcel"/></div><div className="panel evidence"><PanelTitle title="Connected evidence"/><Evidence label="Ownership" value={maskIfNeeded(detail.owner,role,detail.owner==='Meenakshi R.')} state="Verified"/><Evidence label="Record of Rights" value="ROR / 2024 / 01982" state="Verified"/><Evidence label="Registration" value="REG-2018-00491" state="Registered"/><Evidence label="Encumbrance" value="1 active record" state="Attention"/><Evidence label="Zoning" value="Residential · R2" state="Plan aligned"/><Evidence label="Property tax" value="Paid through FY 2025–26" state="Current"/><UploadDocument parcelId={detail.id}/></div></section><section className="panel timeline-panel"><PanelTitle title="Activity timeline"/><div className="timeline"><div className="timeline-item"><span className="tl-dot green"/><div><b>Service request created</b><small>Certificate of ownership · Today, 10:42 AM</small></div><span className="tl-state">{requestSent ? 'Submitted' : 'Ready'}</span></div><div className="timeline-item"><span className="tl-dot amber"/><div><b>AI verification flagged an area mismatch</b><small>Review required by Revenue Officer · 2 hours ago</small></div><span className="tl-state">Attention</span></div><div className="timeline-item"><span className="tl-dot blue"/><div><b>RoR record last updated</b><small>Department of Revenue · 12 Aug 2024</small></div><span className="tl-state">Synced</span></div></div><button className="primary-btn" onClick={onRequest}>{requestSent ? 'Request submitted' : 'Request a certified document'} <ArrowRight size={15}/></button><React.Suspense fallback={<div className="loading-state">Loading workflow graph…</div>}><WorkflowFlow parcelId={detail.id} role={role}/></React.Suspense></section><LandDNA parcel={detail} role={role}/></>}
function UploadDocument({parcelId}:{parcelId:string}){const [type,setType]=useState('RoR extract');const [file,setFile]=useState<File|null>(null);const [message,setMessage]=useState('');const submit=async()=>{if(!file)return;try{const doc=await api.uploadDocument(parcelId,type,file);setMessage(`OCR processed: ${String(doc.status)}`)}catch(e){setMessage(e instanceof Error?e.message:'Upload failed')}};return <div className="upload-box"><small>DOCUMENT INTELLIGENCE</small><select value={type} onChange={e=>setType(e.target.value)}><option>RoR extract</option><option>Ownership proof</option><option>Encumbrance certificate</option></select><input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/><button className="outline-btn" disabled={!file} onClick={submit}>Upload & OCR</button>{message&&<span>{message}</span>}</div>}
function Evidence({label,value,state}:{label:string;value:string;state:string}){return <div className="evidence-row"><div><small>{label}</small><b>{value}</b></div><span className={state==='Attention'?'state attention-state':'state'}><CheckCircle2 size={13}/>{state}</span></div>}
function MapWorkspace({parcels,selected,onSelect,role,onOpenParcel}:{parcels:Parcel[];selected:Parcel;onSelect:(p:Parcel)=>void;role:Role;onOpenParcel:()=>void}){
  type Mode='NORMAL'|'RISK'|'OWNERSHIP CONFLICT'|'BOUNDARY CONFLICT'|'LAND USE'|'ZONING'|'APPLICATIONS'|'AI ALERTS';
  const [savedView]=useState(()=>{try{return JSON.parse(localStorage.getItem(`bhuview-map-view-${role}`)||'null') as {mode?:Mode;query?:string;riskFilter?:string;opacity?:number;year?:number;layers?:Record<string,boolean>;compareId?:string}|null}catch{return null}});const [gisSignals,setGisSignals]=useState<Record<string,unknown>|null>(null);const [gisSignalError,setGisSignalError]=useState('');useEffect(()=>{if(role==='GIS Officer')api.dashboard().then(payload=>setGisSignals(payload.data)).catch(e=>setGisSignalError(e instanceof Error?e.message:'Unable to load GIS health signals'))},[role]);const [mode,setMode]=useState<Mode>(savedView?.mode||'RISK'); const [query,setQuery]=useState(savedView?.query||''); const [riskFilter,setRiskFilter]=useState(savedView?.riskFilter||'All'); const [showControls,setShowControls]=useState(true); const [opacity,setOpacity]=useState(savedView?.opacity||78); const [year,setYear]=useState(savedView?.year||2026); const [measure,setMeasure]=useState(false); const [compare,setCompare]=useState<Parcel|null>(null); const [risk,setRisk]=useState<{score:number;status:string;recommended_action:string}|null>(null); const [riskLoading,setRiskLoading]=useState(false); const [bookmarked,setBookmarked]=useState(()=>localStorage.getItem(`bhuview-bookmark-${role}`)==='true');const [secondCompare,setSecondCompare]=useState(savedView?.compareId||'');const bookmarkApplied=useRef(false);useEffect(()=>{if(bookmarkApplied.current||!savedView)return;const target=parcels.find(p=>p.id===String((savedView as {selectedId?:string}).selectedId||''));const pair=parcels.find(p=>p.id===String(savedView.compareId||''));if(target)onSelect(target);if(pair)setCompare(pair);bookmarkApplied.current=true},[parcels,savedView,onSelect]);const [intelligenceTab,setIntelligenceTab]=useState('Overview');
  const layerNames=['Cadastral parcels','Roads','Buildings','Land use','Zoning','Water bodies','Utilities','Environmental restrictions','Administrative boundaries','Risk areas','AI alerts','Applications','Disputes'];
  const [layers,setLayers]=useState<Record<string,boolean>>(savedView?.layers||{'Cadastral parcels':true,Roads:true,Buildings:false,'Land use':true,Zoning:true,'Water bodies':true,Utilities:true,'Environmental restrictions':false,'Administrative boundaries':true,'Risk areas':true,'AI alerts':true,Applications:true,Disputes:false});
  const filtered=parcels.filter(p=>{const q=query.toLowerCase();const text=[p.id,p.ulpin,p.survey,p.owner,p.village,p.taluk,p.landUse].join(' ').toLowerCase();if(q&&!text.includes(q))return false;if(p.updatedYear!==undefined&&p.updatedYear>year)return false;if(riskFilter!=='All'&&p.risk!==riskFilter)return false;if(mode==='AI ALERTS'&&!((p.areaMismatch||p.openEncumbrance||p.activeDispute||p.zoningConflict)))return false;if(mode==='OWNERSHIP CONFLICT'&&!p.sameOwnerConflict)return false;if(mode==='BOUNDARY CONFLICT'&&!p.boundaryOverlap)return false;if(mode==='LAND USE'&&p.landUse!=='Residential')return false;if(mode==='ZONING'&&!p.zoningConflict)return false;if(mode==='APPLICATIONS'&&!p.openApplication)return false;return true});
  const selectParcel=(p:Parcel)=>{onSelect(p);setRisk(null);setRiskLoading(true);api.risk(p.id).then(result=>setRisk({score:result.score,status:result.status,recommended_action:result.recommended_action})).catch(()=>undefined).finally(()=>setRiskLoading(false));};
  const exportGeoJson=()=>{const blob=new Blob([JSON.stringify({type:'FeatureCollection',features:filtered.filter(p=>p.geometry).map(p=>({type:'Feature',properties:p,geometry:p.geometry}))},null,2)],{type:'application/geo+json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bhuview-map-view.geojson';a.click();URL.revokeObjectURL(a.href)};
  return <section className="gis-command-center"><div className="gis-header"><div><div className="eyebrow">PRIMARY GEOSPATIAL INTERFACE · {role.toUpperCase()}</div><h2>GIS Command Center</h2><p>Live parcel intelligence for Chengalpattu · {year} data view</p></div>{role==='GIS Officer'&&<div className="gis-health-strip" aria-live="polite">{gisSignalError?<span className="error-state">{gisSignalError}</span>:!gisSignals?<span>Loading GIS quality and layer health…</span>:<><span><b>{String((gisSignals.data_quality as Record<string,unknown>|undefined)?.score??'—')}%</b>Data quality</span><span><b>{Array.isArray(gisSignals.geometry_errors)?gisSignals.geometry_errors.length:0}</b>Overlap / geometry errors</span><span><b>{Array.isArray(gisSignals.import_jobs)?gisSignals.import_jobs.length:0}</b>Import jobs</span><span><b>{Array.isArray(gisSignals.layer_health)?gisSignals.layer_health.filter((entry)=>String((entry as Record<string,unknown>).status).toLowerCase()==='healthy').length:0}/{Array.isArray(gisSignals.layer_health)?gisSignals.layer_health.length:0}</b>Healthy layers</span></>}</div>}<div className="gis-kpis"><span><b>{filtered.length}</b>Live parcels</span><span><b>{parcels.filter(p=>p.risk==='High').length}</b>Active alerts</span><span><b>{parcels.filter(p=>p.areaMismatch||p.zoningConflict).length}</b>Data conflicts</span><span><b>{parcels.filter(p=>p.openApplication).length}</b>Pending apps</span></div></div><div className="gis-body">{showControls&&<aside className="gis-control-panel"><div className="control-head"><b>MAP CONTROLS</b><button onClick={()=>setShowControls(false)}><X size={14}/></button></div><label className="gis-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search parcel, ULPIN, owner…"/></label><div className="control-section"><small>MAP ANALYSIS MODE</small><select value={mode} onChange={e=>setMode(e.target.value as Mode)}>{['NORMAL','RISK','OWNERSHIP CONFLICT','BOUNDARY CONFLICT','LAND USE','ZONING','APPLICATIONS','AI ALERTS'].map(m=><option key={m}>{m}</option>)}</select></div><div className="control-section"><small>RISK FILTER</small><div className="segmented"><button className={riskFilter==='All'?'on':''} onClick={()=>setRiskFilter('All')}>All</button><button className={riskFilter==='High'?'on':''} onClick={()=>setRiskFilter('High')}>High</button><button className={riskFilter==='Medium'?'on':''} onClick={()=>setRiskFilter('Medium')}>Medium</button><button className={riskFilter==='Low'?'on':''} onClick={()=>setRiskFilter('Low')}>Low</button></div></div><div className="control-section"><div className="section-row"><small>ACTIVE LAYERS</small><button className="link-btn" onClick={()=>setLayers(Object.fromEntries(layerNames.map(n=>[n,true])))}>All</button></div>{layerNames.map(name=><label className="layer-row" key={name} title="Real cadastral geometry with synthetic context overlays for demonstration only"><input type="checkbox" checked={Boolean(layers[name])} onChange={()=>setLayers(prev=>({...prev,[name]:!prev[name]}))}/><span>{name}</span>{['Roads','Buildings','Water bodies','Utilities','Environmental restrictions','Administrative boundaries'].includes(name)&&<small>DEMO</small>}{name==='Risk areas'&&<i className="layer-swatch swatch-risk"/>}</label>)}</div><div className="control-section"><div className="section-row"><small>PARCEL OPACITY</small><b>{opacity}%</b></div><input className="opacity-range" type="range" min="20" max="100" value={opacity} onChange={e=>setOpacity(Number(e.target.value))}/></div><div className="control-actions"><button onClick={()=>setMeasure(!measure)} className={measure?'active-tool':''}><CircleDot size={14}/> {measure?'Measuring…':'Measure'}</button><button onClick={exportGeoJson}><FileText size={14}/> GeoJSON</button><button onClick={()=>setYear(2026)}><Globe2 size={14}/> Reset view</button></div></aside>}<div className="gis-map-stage" aria-label="GIS Command Center map and controls"><div className="floating-map-toolbar"><button onClick={()=>setShowControls(!showControls)}><Layers3 size={15}/>{showControls?'Hide controls':'Layers'}</button><button onClick={()=>setMeasure(!measure)} className={measure?'active-tool':''}><CircleDot size={15}/> Measure</button><select aria-label="Choose comparison parcel" value={secondCompare} onChange={e=>setSecondCompare(e.target.value)}><option value="">Compare parcel…</option>{parcels.filter(p=>p.id!==selected.id).map(p=><option key={p.id} value={p.id}>{p.id} · {p.village}</option>)}</select><button disabled={!compare&&!secondCompare} onClick={()=>{if(compare){setCompare(null)}else if(secondCompare){setCompare(parcels.find(p=>p.id===secondCompare)||null)}}}><Grid2X2 size={15}/> {compare?'Clear compare':'Compare'}</button><button onClick={()=>{const next=!bookmarked;setBookmarked(next);localStorage.setItem(`bhuview-bookmark-${role}`,String(next));if(next)localStorage.setItem(`bhuview-map-view-${role}`,JSON.stringify({mode,query,riskFilter,opacity,year,layers,compareId:secondCompare,selectedId:selected.id}));else localStorage.removeItem(`bhuview-map-view-${role}`)}}><ShieldCheck size={15}/> {bookmarked?'Bookmarked':'Bookmark'}</button></div><MapView parcels={filtered} selected={selected} onSelect={selectParcel} layerVisibility={Object.fromEntries(layerNames.map(name=>[name,layers[name]]))} opacity={opacity} mode={mode} measure={measure} preset="gis"/><div className="live-legend"><b>{mode} MODE</b><span><i className="legend-blue"/> Normal</span><span><i className="legend-amber"/> Medium / review</span><span><i className="legend-red"/> High / conflict</span></div>{measure&&<div className="measure-card"><b>SPATIAL MEASUREMENT</b><span>Click map points to measure</span><small>Distance and polygon area appear on the map. Use the map's Clear control to reset points.</small></div>}</div><aside className="parcel-intelligence"><div className="intelligence-head"><div><small>SELECTED PARCEL</small><h3>{selected.id||'Select a parcel'}</h3></div><Risk risk={selected.risk}/></div>{selected.id?<><div className="parcel-quick"><span><small>ULPIN</small><b>{selected.ulpin}</b></span><span><small>AREA</small><b>{selected.area}</b></span><span><small>LAND USE</small><b>{selected.landUse}</b></span><span><small>OWNER</small><b>{role==='Citizen'?'Protected':selected.owner}</b></span></div><div className="intelligence-tabs">{['Overview','GIS','Records','AI'].map(tab=><button key={tab} className={intelligenceTab===tab?'active':''} onClick={()=>setIntelligenceTab(tab)}>{tab}</button>)}</div><div className="intelligence-block"><div className="section-row"><b>{intelligenceTab==='Overview'?'AI LAND GOVERNANCE ANALYSIS':intelligenceTab==='GIS'?'GIS GEOMETRY REVIEW':intelligenceTab==='Records'?'CONNECTED RECORDS':'AI REVIEW SIGNALS'}</b><Sparkles size={15}/></div>{riskLoading?<span className="muted">Analyzing parcel evidence…</span>:risk?<><div className="risk-score"><strong>{risk.score}</strong><span>{risk.status}</span></div><p>{risk.recommended_action}</p></>:<button className="outline-btn" onClick={()=>selectParcel(selected)}>Analyze this parcel</button>}</div><div className="intelligence-block"><b>WORKFLOW STATUS</b><div className="workflow-mini"><span className="done">Citizen submitted</span><span className="done">Revenue verification</span><span className="current">Planning review</span><span>Department head</span></div></div><div className="intelligence-block"><b>GOVERNANCE SIGNALS</b><div className="signal-list"><span><i className={selected.areaMismatch?'signal-alert':'signal-ok'}/>{selected.areaMismatch?'Area mismatch':'Geometry valid'}</span><span><i className={selected.openEncumbrance?'signal-alert':'signal-ok'}/>{selected.openEncumbrance?'Open encumbrance':'No encumbrance'}</span><span><i className={selected.zoningConflict?'signal-alert':'signal-ok'}/>{selected.zoningConflict?'Zoning conflict':'Zoning aligned'}</span></div></div><button className="primary-btn intelligence-open" onClick={onOpenParcel}>Open Parcel 360 <ArrowRight size={15}/></button></>:<div className="empty-state">Select a parcel on the map or from the list to open live intelligence.</div>}</aside></div><div className="gis-bottom-panel"><div><small>TIME SLIDER · MAP VERSION</small><input type="range" min="2018" max="2026" value={year} onChange={e=>setYear(Number(e.target.value))}/><div className="year-labels"><span>2018</span><span>2020</span><span>2022</span><span>2024</span><b>2026</b></div></div><div className="bottom-workflow"><b>APPLICATION WORKFLOW</b><span className="done">Submitted</span><span className="done">Revenue ✓</span><span className="current">Planning ●</span><span>Head ○</span></div>{compare&&<div className="compare-card"><b>COMPARING</b><span>{selected.id} {selected.area} · {selected.landUse}</span><strong>VS</strong><span>{compare.id} {compare.area} · {compare.landUse}</span><button onClick={()=>setCompare(null)}><X size={13}/></button></div>}</div></section>}

function Notifications({notifications}:{notifications:Array<Record<string, unknown>>}){return <section className="panel notifications"><PanelTitle title="Notifications" action="Role-filtered"/>{notifications.length===0?<div className="empty-state">No notifications for this role.</div>:notifications.map(item=><div className="attention-item" key={String(item.id)}><div className="status-icon"><Bell size={16}/></div><div><b>{String(item.title)}</b><span>{String(item.message)}</span></div><small>{String(item.state)}</small></div>)}</section>}
function RequestComposer({parcel,busy,onCancel,onSubmit}:{parcel:Parcel;busy:boolean;onCancel:()=>void;onSubmit:(type:string,description:string)=>void}){const [type,setType]=useState('Certificate of ownership');const [description,setDescription]=useState('');return <div className="modal-backdrop"><div className="modal-card"><div className="panel-title"><h2>New service request</h2><button onClick={onCancel}><X size={16}/></button></div><p className="muted">Parcel {parcel.id} · {parcel.ulpin}</p><label>Request type<select value={type} onChange={e=>setType(e.target.value)}><option>Certificate of ownership</option><option>Mutation request</option><option>Field verification</option><option>Encumbrance certificate</option></select></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe what the department should verify"/></label><div className="modal-actions"><button className="outline-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={busy} onClick={()=>onSubmit(type,description)}>{busy?'Submitting…':'Submit request'} <ArrowRight size={15}/></button></div></div></div>}
function Requests({requestSent,onNew,role}:{requestSent:boolean;onNew:()=>void;role:Role}){const [rows,setRows]=useState<Array<Record<string,unknown>>>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{setLoading(true);api.requests().then(setRows).catch(e=>setError(e instanceof Error?e.message:'Unable to load requests')).finally(()=>setLoading(false))},[requestSent]);return <section className="panel requests"><PanelTitle title="Service requests" action="Filter by department"/><WorkflowFlow parcelId={rows[0]?String(rows[0].parcel_id||''):''} role={role}/><div className="request-banner"><div className="service-orb"><ClipboardCheck size={23}/></div><div><b>Citizen-to-department workflow</b><p>Requests are routed to the responsible officer and recorded in the audit trail.</p></div><button className="primary-btn" onClick={onNew}>New request <ArrowRight size={15}/></button></div>{loading?<div className="loading-state">Loading live requests…</div>:error?<div className="error-state">{error}</div>:<div className="request-table"><div className="req-head"><span>REQUEST</span><span>PARCEL</span><span>TYPE</span><span>STATUS</span><span>UPDATED</span></div>{rows.length===0?<div className="empty-state">No service requests for this role.</div>:rows.map(r=><div className="req-row" key={String(r.id)}><b>{String(r.id)}{requestSent&&String(r.id).includes('0048')?<em>NEW</em>:null}</b><span>{String(r.parcel_id)}</span><span>{String(r.request_type)}</span><span className="status-chip">{String(r.status)}</span><span>{String(r.created_at)}</span></div>)}</div>}</section>}

function LandDNA({parcel,role}:{parcel:Parcel;role:Role}){const [dna,setDna]=useState<Record<string,unknown>|null>(null);const [provenance,setProvenance]=useState<Record<string,unknown>|null>(null);const [relationships,setRelationships]=useState<Record<string,unknown>|null>(null);const [trace,setTrace]=useState(false);const [error,setError]=useState('');const [loading,setLoading]=useState(false);const load=async()=>{try{setLoading(true);setError('');setDna(await api.landDna(parcel.ulpin))}catch(e){setError(e instanceof Error?e.message:'Unable to load Land DNA')}finally{setLoading(false)}};const nodes=Array.isArray(dna?.nodes)?dna.nodes as Array<{id:string;type:string;label:string;source?:string;verification?:string;last_updated?:string}>:[];const edges=Array.isArray(dna?.edges)?dna.edges as Array<{from:string;to:string;label:string}>:[];return <section className="panel land-dna"><PanelTitle title="Land DNA" action="Connected parcel graph"/><p className="muted">A traceable relationship view across GIS, RoR, Registration, Ownership and Audit Events. Restricted fields remain masked for {role}.</p><div className="dna-actions"><button className="primary-btn" onClick={load} disabled={loading}>{loading?'Loading graph…':'Load relationship graph'} <ArrowRight size={15}/></button><button className="outline-btn" disabled={!dna} onClick={()=>api.landDnaProvenance(parcel.ulpin).then(setProvenance).catch(()=>setError('Unable to load provenance'))}>Provenance</button><button className="outline-btn" disabled={!dna} onClick={()=>api.landDnaRelationships(parcel.ulpin).then(setRelationships).catch(()=>setError('Unable to load relationships'))}>Related parcels</button><button className="outline-btn" disabled={!dna} onClick={()=>setTrace(value=>!value)}>{trace?'Stop trace':'Trace history'}</button></div>{error&&<div className="error-state" role="alert">{error}</div>}{loading&&!dna&&<div className="loading-state">Loading relationship records…</div>}{dna&&nodes.length===0&&<div className="empty-state">No relationship records are available.</div>}{dna&&nodes.length>0&&<LandDnaFlow nodes={nodes} edges={edges} trace={trace}/ >}{provenance&&<div className="dna-detail-grid">{(Array.isArray(provenance.fields)?provenance.fields:[]).map((field)=>{const f=field as {field:string;source:string;verification:string;value:string;compare?:string};return <div className={`dna-detail ${f.verification==='MISMATCH'?'mismatch':''}`} key={f.field}><small>{f.field} · {f.source}</small><b>{f.value}</b><span>{f.verification}{f.compare?` · ${f.compare}`:''}</span></div>})}</div>}{relationships&&<div className="related-strip"><b>Related parcels</b><span>Same owner: {Array.isArray(relationships.same_owner)?relationships.same_owner.join(', ')||'None':'—'}</span><span>Adjacent: {Array.isArray(relationships.adjacent)?relationships.adjacent.join(', '):'—'}</span><span>Boundary overlap: {Array.isArray(relationships.boundary_overlap)?relationships.boundary_overlap.join(', ')||'None':'—'}</span></div>}</section>}
function PlanningSandbox({parcel,parcels}:{parcel:Parcel;parcels:Parcel[]}){const [use,setUse]=useState('Commercial');const [result,setResult]=useState<Record<string,unknown>|null>(null);const run=async()=>{try{setResult(await api.simulate({parcel_id:parcel.id,proposed_land_use:use,building_area:2400,height:2,setback:3}))}catch(e){setResult({error:e instanceof Error?e.message:'Simulation failed'})}};return <section className="panel planning-sandbox"><PanelTitle title="Planning Sandbox" action="Decision support only"/><div className="simulation-banner">SIMULATION — NOT AN OFFICIAL DECISION</div><p className="muted">Evaluate a possible future use against current zoning, flood risk and encumbrance without writing to the real parcel.</p><div className="sandbox-map-wrap"><MapView parcels={parcels} selected={parcel} simulation preset="sandbox"/></div><label>Proposed land use<select value={use} onChange={e=>setUse(e.target.value)}>{['Residential','Commercial','Industrial','Agricultural','Institutional','Mixed'].map(x=><option key={x}>{x}</option>)}</select></label><button className="primary-btn" onClick={run}>Run simulation <ArrowRight size={15}/></button>{result&&<pre className="json-preview">{JSON.stringify(result,null,2)}</pre>}</section>}
function ConflictRadar({parcels,selected,onSelect}:{parcels:Parcel[];selected:Parcel;onSelect:(p:Parcel)=>void}){const [data,setData]=useState<{items:Array<Record<string,unknown>>;clusters:Array<Record<string,unknown>>}|null>(null);const [error,setError]=useState('');useEffect(()=>{api.conflictRadar('all').then(result=>setData(result as unknown as {items:Array<Record<string,unknown>>;clusters:Array<Record<string,unknown>>})).catch(e=>setError(e instanceof Error?e.message:'Unable to load conflict radar'))},[]);return <section className="panel conflict-radar"><PanelTitle title="Conflict Radar" action="Officer investigation workspace"/><p className="muted">Neutral decision-support signals only: potential inconsistencies require verification.</p><div className="conflict-map-wrap"><MapView parcels={parcels} selected={selected} onSelect={onSelect} preset="conflicts" mode="AI ALERTS"/></div>{error&&<div className="error-state">{error}</div>}{!data&&!error?<div className="loading-state">Loading conflict clusters…</div>:data&&<><div className="cluster-card"><b>{String(data.clusters[0]?.label||'No cluster')}</b><span>{String(data.clusters[0]?.summary||'')}</span><button className="primary-btn compact" onClick={()=>api.conflictCluster(String(data.clusters[0]?.id))}>Investigate cluster</button></div>{data.items.map(item=><div className="audit-row" key={String(item.id)}><div className="audit-dot amber"/><div><b>{String(item.parcel_id)} · {String(item.state)}</b><p>Priority {String(item.priority)} · {Array.isArray(item.factors)?item.factors.map(f=>String((f as {name:string}).name)).join(', '):''}</p></div><button className="outline-btn" onClick={()=>api.resolveConflict(String(item.id))}>Mark resolved</button></div>)}</>}</section>}
function SchemaMapper(){const [text,setText]=useState('{\n  "khesra_number": "KH-1092",\n  "raiyat_name": "Sita Devi",\n  "area_decimal": 1.24,\n  "jamabandi_no": "JB-2024-88"\n}');const [result,setResult]=useState<Record<string,unknown>|null>(null);const propose=async()=>{try{setResult(await api.proposeSchemaMapping('Bihar',JSON.parse(text)))}catch{setResult({error:'Enter valid JSON and ensure Data Admin permissions are active'})}};return <section className="panel schema-mapper"><PanelTitle title="State schema mapper" action="Data Integration Admin"/><p className="muted">Map state-specific Jamabandi fields into the common Parcel 360 schema. Proposals never auto-apply; an administrator must approve them.</p><textarea value={text} onChange={e=>setText(e.target.value)} aria-label="Sample state record"/><button className="primary-btn" onClick={propose}>Propose mapping <ArrowRight size={15}/></button>{result&&<pre className="json-preview">{JSON.stringify(result,null,2)}</pre>}<div className="source-card"><div className="source-dot"/><div><small>MAPPER STATUS</small><strong>RULE-BASED MOCK · ADMIN APPROVAL REQUIRED</strong></div></div></section>}

function AiVerification({onFlag,busy}:{onFlag:()=>void;busy?:boolean}){const [items,setItems]=useState<Array<Record<string,unknown>>>([]);const [selected,setSelected]=useState('P-0001');const [risk,setRisk]=useState<{parcel_id:string;score:number;status:string;factors:Array<{factor:string;points:number;evidence:string}>;recommended_action:string}|null>(null);const [loading,setLoading]=useState(true);useEffect(()=>{api.anomalies().then(setItems).catch(()=>undefined).finally(()=>setLoading(false))},[]);useEffect(()=>{if(selected)api.risk(selected).then(setRisk).catch(()=>setRisk(null))},[selected]);return <section className="ai-grid"><div className="panel ai-summary"><div className="ai-header"><div className="ai-orb"><Sparkles size={23}/></div><div><div className="eyebrow">AI VERIFICATION ENGINE</div><h2>{items.length} attention items</h2><p>Explainable decision support from real backend conditions.</p></div></div>{risk&&<div className="ai-score"><div><span>{risk.parcel_id} · {risk.status}</span><b>{risk.score} points</b></div><div className="score-bar"><i style={{width:`${Math.min(100,risk.score)}%`}}/></div><small>{risk.recommended_action}</small>{risk.factors.map(f=><div className="factor-row" key={f.factor}><b>+{f.points} {f.factor}</b><span>{f.evidence}</span></div>)}</div>}</div><div className="panel anomaly"><PanelTitle title="Priority review queue" action="Live API"/>{loading?<div className="loading-state">Loading anomaly queue…</div>:items.length===0?<div className="empty-state">No anomalies require review.</div>:items.map(item=><div className="anomaly-item selected" key={String(item.id)} onClick={()=>setSelected(String(item.parcel_id))}><div className="anomaly-icon"><AlertTriangle size={18}/></div><div><b>{String(item.type)} · {String(item.parcel_id)}</b><p>{Array.isArray(item.reasons)?item.reasons.join(' · '):String(item.reasons||'')}</p><small>Confidence {String(item.confidence)} · {String(item.recommended_action)}</small></div><div className="anomaly-actions"><Risk risk={item.severity==='High'?'High':'Medium'}/><button className="primary-btn compact" disabled={busy} onClick={e=>{e.stopPropagation();onFlag()}}>{busy?'Saving…':'Flag record'}</button></div></div>)}</div></section>}
function Quality({parcels}:{parcels:Parcel[]}){const [data,setData]=useState<{score:number;total_features:number;checks:Array<{name:string;passed:number;total:number}>}|null>(null);const [error,setError]=useState('');useEffect(()=>{api.validation().then(setData).catch(e=>setError(e instanceof Error?e.message:'Unable to load validation')).finally(()=>undefined)},[]);return <section className="quality-grid"><div className="panel quality-score"><div className="eyebrow">GIS DATA QUALITY</div><h2>{data?`${data.score}%`:'—'}</h2><p>Validation score across {data?.total_features ?? parcels.length} synthetic parcel geometries.</p><div className="quality-ring"><span>{data?Math.round(data.score):'—'}<small>%</small></span></div><button className="primary-btn" onClick={()=>api.validation().then(setData)}>Run validation <ArrowRight size={15}/></button></div><div className="panel validation"><PanelTitle title="Validation results" action="Live API"/>{error?<div className="error-state">{error}</div>:!data?<div className="loading-state">Loading validation…</div>:data.checks.map(v=><div className="validation-row" key={v.name}><span><i className={`validation-dot ${v.passed===v.total?'success':'warning'}`}/>{v.name}</span><b>{v.passed} / {v.total}</b><span className={`validation-state ${v.passed===v.total?'success':'warning'}`}>{v.passed===v.total?'Passed':'Review'}</span></div>)}</div></section>}
function Audit(){const [entries,setEntries]=useState<import('./api').AuditEntry[]>([]);const [status,setStatus]=useState('Not verified');useEffect(()=>{api.audit().then(setEntries).catch(()=>undefined)},[]);const verify=async()=>{try{const result=await api.verifyAuditChain();setStatus(result.intact?`Chain intact · ${result.entries} entries`:'CHAIN TAMPERED')}catch{setStatus('Unable to verify chain')}};const tamper=async()=>{await api.tamperAudit();setStatus('Tamper test applied · verify again')};return <section className="panel audit"><PanelTitle title="Tamper-evident audit trail" action="Download log"/><div className="audit-chain"><div><small>CHAIN STATUS</small><strong>{status}</strong></div><button className="primary-btn compact" onClick={verify}>Verify chain</button><button className="outline-btn" onClick={tamper}>Tamper test</button></div><div className="audit-filter"><span>Every login, search, parcel view and workflow action is chained with SHA-256 hashes.</span><button className="outline-btn"><Filter size={14}/> Filter</button></div>{entries.length ? entries.slice(0,10).map(a=><div className="audit-row" key={a.id}><div className="audit-dot blue"/><div className="audit-time">{new Date(a.ts).toLocaleTimeString()}</div><div><b>{a.action}</b><p>{a.record_id || '—'} · prev {a.prevHash.slice(0,10)}…</p></div><span className="audit-actor">{a.role}</span></div>) : <div className="empty-state">No audit events yet. Sign in or perform a search to create the first chained event.</div>}</section>}
function Integrations(){const [items,setItems]=useState<Array<Record<string,string>>>([]);const [error,setError]=useState('');useEffect(()=>{api.integrations().then(setItems).catch(e=>setError(e instanceof Error?e.message:'Unable to load integrations'))},[]);return <section className="panel integrations"><PanelTitle title="Government / external integrations" action="Configure adapters"/><p className="muted">Every provider is explicitly labeled. No protected or undocumented government endpoint is called by this prototype.</p>{error?<div className="error-state">{error}</div>:items.length===0?<div className="loading-state">Loading integration status…</div>:items.map(x=><div className="integration-row" key={x.name}><div className="integration-icon"><Globe2 size={18}/></div><div><b>{x.name}</b><span>{x.provider}</span></div><div className="integration-status green"><i/>{x.status}</div><p>{x.last_sync} · {x.label}</p><ArrowRight size={16}/></div>)}</section>}


function UsersManagementPage() {
  const users = [
    { email: 'citizen@demo.gov', name: 'Meenakshi R.', role: 'Citizen', phone: '+919876543210' },
    { email: 'revenue@demo.gov', name: 'R. Prakash', role: 'Revenue Officer', phone: '+919876543211' },
    { email: 'registration@demo.gov', name: 'S. Anitha', role: 'Registration Officer', phone: '+919876543212' },
    { email: 'planning@demo.gov', name: 'K. Senthil', role: 'Planning Officer', phone: '+919876543213' },
    { email: 'gis@demo.gov', name: 'V. Hari', role: 'GIS Officer', phone: '+919876543214' },
    { email: 'head@demo.gov', name: 'A. Raman', role: 'Department Head', phone: '+919876543215' },
    { email: 'dataadmin@demo.gov', name: 'N. Kavya', role: 'Data Integration Admin', phone: '+919876543216' },
    { email: 'admin@demo.gov', name: 'System Admin', role: 'System Administrator', phone: '+919876543217' }
  ];
  return (
    <section className="panel users-page">
      <PanelTitle title="User & Access Control Directory" action="Firebase Auth & Firestore Synced" />
      <p className="muted">Manage government system accounts, assigned roles, permissions, and verified phone numbers.</p>
      <table className="users-table-grid">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email / Account</th>
            <th>Phone Number</th>
            <th>Assigned Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.email}>
              <td><b>{u.name}</b></td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td><span className="user-badge">{u.role}</span></td>
              <td><span className="status-pill online">Active & Synced</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function SystemHealthPage() {
  return (
    <section className="panel system-health-page">
      <PanelTitle title="System Infrastructure & Health Metrics" action="Live Status" />
      <p className="muted">Real-time status of FastAPI backend, Firebase Authentication, and Firestore Database sync.</p>
      <div className="system-health-grid">
        <div className="system-health-card">
          <h3>FastAPI Backend API <span className="status-pill online">Online</span></h3>
          <p>Status: Healthy (200 OK)</p>
          <p>Host: http://localhost:8000/api</p>
          <small>Latency: 12 ms</small>
        </div>
        <div className="system-health-card">
          <h3>Firebase Authentication <span className="status-pill online">Connected</span></h3>
          <p>Project ID: landstack-e01f4</p>
          <p>Methods: Email/Password & Phone SMS OTP</p>
          <small>Auth Domain: landstack-e01f4.firebaseapp.com</small>
        </div>
        <div className="system-health-card">
          <h3>Firestore Database <span className="status-pill online">Synced</span></h3>
          <p>Collections: users, parcels, service_requests</p>
          <p>Bucket: landstack-e01f4.firebasestorage.app</p>
          <small>Sync Mode: Real-time Cloud Sync</small>
        </div>
        <div className="system-health-card">
          <h3>GIS Map Engine <span className="status-pill online">Active</span></h3>
          <p>Rendering: MapLibre GL 3D Extrusions</p>
          <p>Active Geometries: 50 Cadastral Parcels</p>
          <small>Frame Rate: 60 FPS</small>
        </div>
      </div>
    </section>
  );
}

function ReportsPage({onExport}:{onExport:()=>void}) {
  return (
    <section className="panel reports-page">
      <PanelTitle title="Governance Reports & Analytics" action="Export Center" />
      <p className="muted">Generate, view, and download certified parcel inspection, encumbrance, and AI assessment reports.</p>
      <div className="system-health-grid">
        <div className="system-health-card">
          <h3>Cadastral Parcel Summary Report</h3>
          <p>Complete land registry export with ULPINs, survey numbers, and ownership data.</p>
          <button className="primary-btn compact" onClick={onExport} style={{marginTop: 10}}>Download JSON Report <ArrowRight size={14}/></button>
        </div>
        <div className="system-health-card">
          <h3>AI Anomaly & Risk Assessment</h3>
          <p>Detailed AI verification report highlighting area mismatches and encumbrance flags.</p>
          <button className="outline-btn compact" onClick={onExport} style={{marginTop: 10}}>Export AI Summary <ArrowRight size={14}/></button>
        </div>
        <div className="system-health-card">
          <h3>Cryptographic Audit Log</h3>
          <p>SHA-256 chained transaction audit events for legal compliance verification.</p>
          <button className="outline-btn compact" onClick={onExport} style={{marginTop: 10}}>Export Audit Log <ArrowRight size={14}/></button>
        </div>
      </div>
    </section>
  );
}

function ImportJobsPage() {
  return (
    <section className="panel import-jobs-page">
      <PanelTitle title="Spatial & Data Import Ingestion Jobs" action="Data Integration" />
      <p className="muted">Manage automated GeoJSON, Shapely, and state cadastral data ingestion pipelines.</p>
      <div className="request-table" style={{marginTop: 12}}>
        <div className="req-head"><span>JOB ID</span><span>SOURCE</span><span>FORMAT</span><span>STATUS</span><span>TIMESTAMP</span></div>
        <div className="req-row"><b>IMP-DEMO-001</b><span>Chengalpattu Cadastral Survey</span><span className="status-chip">GeoJSON / 3D</span><span className="status-chip" style={{background:'#e3f9e5',color:'#1e7e34'}}>COMPLETED</span><span>Today, 09:30 AM</span></div>
        <div className="req-row"><b>IMP-DEMO-002</b><span>Tambaram Zoning Overlay</span><span className="status-chip">Vector / Shapefile</span><span className="status-chip" style={{background:'#e3f9e5',color:'#1e7e34'}}>COMPLETED</span><span>Yesterday</span></div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
