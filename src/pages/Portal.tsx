import { useState, useEffect } from 'react';
import {
  LayoutDashboard, User, Users, GraduationCap, CreditCard, DollarSign,
  BarChart3, Home, Upload, Sliders, ClipboardCheck, Send, TrendingUp,
  Bell, Calendar, Settings, HelpCircle, LogOut, Menu, ChevronRight,
  Shield, FileSearch
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Dashboard from './portal/Dashboard';
import PersonalInfo from './portal/PersonalInfo';
import CoApplicantDetails from './portal/CoApplicantDetails';
import EducationalInfo from './portal/EducationalInfo';
import LoanRequirement from './portal/LoanRequirement';
import IncomeDetails from './portal/IncomeDetails';
import FinancialDetails from './portal/FinancialDetails';
import CollateralDetails from './portal/CollateralDetails';
import NonCollateralDetails from './portal/NonCollateralDetails';
import EligibilityAssessment from './portal/EligibilityAssessment';
import DocumentUpload from './portal/DocumentUpload';
import LoanPreferences from './portal/LoanPreferences';
import ReviewApplication from './portal/ReviewApplication';
import ApplicationStatus from './portal/ApplicationStatus';
import Notifications from './portal/Notifications';
import Appointments from './portal/Appointments';
import ProfileSettings from './portal/ProfileSettings';
import SettingsPage from './portal/SettingsPage';
import HelpSupport from './portal/HelpSupport';

export type NavId =
  | 'dashboard' | 'personal' | 'co_applicant' | 'education' | 'loan_req'
  | 'income' | 'financial' | 'collateral' | 'non_collateral' | 'eligibility' | 'documents'
  | 'loan_pref' | 'review' | 'submit' | 'status' | 'notifications'
  | 'appointments' | 'profile' | 'settings' | 'help';

interface NavItem { id: NavId; label: string; icon: React.ElementType; dimmed?: boolean }

const buildNavGroups = (loanType: 'collateral' | 'non_collateral') => [
  {
    group: 'Overview',
    items: [
      { id: 'dashboard' as NavId, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Application',
    items: [
      { id: 'personal' as NavId, label: 'Personal Information', icon: User },
      { id: 'co_applicant' as NavId, label: 'Co-Applicant Details', icon: Users },
      { id: 'education' as NavId, label: 'Educational Information', icon: GraduationCap },
      { id: 'loan_req' as NavId, label: 'Loan Requirement', icon: CreditCard },
      { id: 'income' as NavId, label: 'Income Details', icon: DollarSign },
      { id: 'financial' as NavId, label: 'Financial Details', icon: BarChart3 },
      { id: 'collateral' as NavId, label: 'Collateral Details', icon: Home, dimmed: loanType !== 'collateral' },
      { id: 'non_collateral' as NavId, label: 'Non-Collateral Loan', icon: FileSearch, dimmed: loanType !== 'non_collateral' },
      { id: 'eligibility' as NavId, label: 'Eligibility Assessment', icon: Shield },
      { id: 'documents' as NavId, label: 'Document Upload', icon: Upload },
      { id: 'loan_pref' as NavId, label: 'Loan Preferences', icon: Sliders },
      { id: 'review' as NavId, label: 'Review Application', icon: ClipboardCheck },
      { id: 'submit' as NavId, label: 'Submit Application', icon: Send },
    ],
  },
  {
    group: 'Track & Manage',
    items: [
      { id: 'status' as NavId, label: 'Application Status', icon: TrendingUp },
      { id: 'notifications' as NavId, label: 'Notifications', icon: Bell },
      { id: 'appointments' as NavId, label: 'Appointments', icon: Calendar },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'profile' as NavId, label: 'Profile', icon: User },
      { id: 'settings' as NavId, label: 'Settings', icon: Settings },
      { id: 'help' as NavId, label: 'Help & Support', icon: HelpCircle },
    ],
  },
];

const BASE_APP_STEPS: NavId[] = [
  'personal', 'co_applicant', 'education', 'loan_req',
  'income', 'financial', 'eligibility', 'documents', 'loan_pref', 'review', 'submit',
];

export default function Portal({ onLogout, isAdmin, initialActive }: { onLogout: () => void; isAdmin?: boolean; initialActive?: NavId }) {
  const [active, setActive] = useState<NavId>(initialActive ?? 'dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name?: string; id?: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<NavId>>(new Set());
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loanType, setLoanType] = useState<'collateral' | 'non_collateral'>('collateral');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? '', full_name: data.user.user_metadata?.full_name, id: data.user.id });
        loadApplicationProgress(data.user.id);
        loadUnread(data.user.id);
      }
    });
  }, []);

  const loadUnread = async (uid: string) => {
    const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('read', false);
    setUnreadCount(count ?? 0);
  };

  const loadApplicationProgress = async (uid: string) => {
    const { data: app } = await supabase
      .from('applications')
      .select('id, current_step, personal_info, academic_info, preferred_country, loan_type, non_collateral_details')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (app) {
      setApplicationId(app.id);
      const lt = (app.loan_type as 'collateral' | 'non_collateral') ?? 'collateral';
      setLoanType(lt);

      const completed = new Set<NavId>();
      if (app.personal_info && Object.keys(app.personal_info).length > 0) completed.add('personal');
      if (app.academic_info && Object.keys(app.academic_info).length > 0) completed.add('education');
      if (app.preferred_country) completed.add('loan_req');
      if (app.current_step >= 5) completed.add('income');
      if (app.current_step >= 6) completed.add('financial');
      if (app.current_step >= 7) {
        if (lt === 'collateral') completed.add('collateral');
      }
      if (app.non_collateral_details && Object.keys(app.non_collateral_details).length > 0) completed.add('non_collateral');
      if (app.current_step >= 9) completed.add('documents');
      if (app.current_step >= 10) completed.add('loan_pref');
      if (app.current_step >= 11) completed.add('review');
      if (app.status === 'submitted') completed.add('submit');
      setCompletedSteps(completed);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const navigate = (id: NavId) => { setActive(id); setSidebarOpen(false); };

  const handleLoanTypeChange = (type: 'collateral' | 'non_collateral') => {
    setLoanType(type);
    // If currently on the section that's being hidden, move away
    if (type === 'non_collateral' && active === 'collateral') setActive('non_collateral');
    if (type === 'collateral' && active === 'non_collateral') setActive('collateral');
  };

  const navGroups = buildNavGroups(loanType);
  const allNavItems: NavItem[] = navGroups.flatMap(g => g.items as NavItem[]);
  const appSteps: NavId[] = [
    ...BASE_APP_STEPS.slice(0, 6), // personal through financial
    loanType === 'collateral' ? 'collateral' : 'non_collateral',
    ...BASE_APP_STEPS.slice(6), // documents through submit
  ];
  const progressPct = Math.round((completedSteps.size / appSteps.length) * 100);

  const sidebarContent = (
    <nav className="flex flex-col h-full bg-ob">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-pw rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-ob" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-pw text-sm block truncate">GradCredit</span>
            <span className="text-si text-xs">{isAdmin ? 'Admin Panel' : 'Student Portal'}</span>
          </div>
        </div>
      </div>

      {/* User + progress */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-pw rounded-full flex items-center justify-center shrink-0">
            <span className="text-ob font-bold text-xs">{(user?.full_name || user?.email || 'U')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-pw text-xs truncate">{user?.full_name || 'Student'}</div>
            <div className="text-si text-xs truncate">{user?.email}</div>
          </div>
        </div>
        {!isAdmin && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-si">Progress</span>
              <span className="font-semibold text-pw">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-pw h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            {/* Loan type pill */}
            <div className="mt-2 flex">
              <span className={`badge text-xs ${loanType === 'non_collateral' ? 'bg-sg/40 text-ob' : 'bg-sg/40 text-ob/60'}`}>
                {loanType === 'non_collateral' ? 'Non-Collateral Loan' : 'Collateral Loan'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
        {navGroups.map(({ group, items }) => (
          <div key={group} className="mb-3">
            <div className="px-2 py-1 text-xs font-semibold text-si/60 uppercase tracking-widest">{group}</div>
            {items.map(({ id, label, icon: Icon, dimmed }) => {
              const isActive = active === id;
              const isDone = completedSteps.has(id as NavId);
              const isStep = appSteps.includes(id as NavId);
              return (
                <button
                  key={id}
                  onClick={() => navigate(id as NavId)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 mb-0.5 ${
                    isActive ? 'bg-sg text-ob' : dimmed ? 'text-si hover:text-sg hover:bg-white/5' : 'text-pw/70 hover:text-pw hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate text-xs">{label}</span>
                  {id === 'notifications' && unreadCount > 0 && !isActive && (
                    <span className="w-4 h-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center shrink-0">{unreadCount}</span>
                  )}
                  {isStep && isDone && !isActive && (
                    <span className="w-3.5 h-3.5 bg-ob rounded-full shrink-0 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium text-error-500 hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-xs">Sign Out</span>
        </button>
      </div>
    </nav>
  );

  const currentLabel = allNavItems.find(n => n.id === active)?.label ?? 'Dashboard';
  const sharedProps = {
    applicationId,
    onNavigate: navigate,
    onStepComplete: (id: NavId) => setCompletedSteps(p => new Set([...p, id])),
  };

  return (
    <div className="portal-theme flex h-screen bg-pw overflow-hidden">
      <aside className="hidden lg:block w-56 shrink-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ob/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 shadow-premium overflow-hidden">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-sg/50 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-sg/30 text-ob transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-ob">{currentLabel}</h1>
          {/* Loan type indicator in header */}
          <span className={`hidden sm:inline badge text-xs ml-1 ${loanType === 'non_collateral' ? 'bg-sg/40 text-ob' : 'bg-sg/40 text-ob/60'}`}>
            {loanType === 'non_collateral' ? 'Non-Collateral' : 'Collateral'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {!isAdmin && (
              <button onClick={() => navigate('notifications')} className="relative p-2 rounded-lg hover:bg-sg/30 text-ob transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
            )}
            {isAdmin && (
              <span className="badge bg-sg/40 text-ob text-xs"><Shield className="w-3 h-3" /> Admin View</span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {active === 'dashboard'      && <Dashboard onNavigate={navigate} applicationId={applicationId} completedSteps={completedSteps} userId={user?.id} loanType={loanType} />}
          {active === 'personal'       && <PersonalInfo {...sharedProps} />}
          {active === 'co_applicant'   && <CoApplicantDetails {...sharedProps} />}
          {active === 'education'      && <EducationalInfo {...sharedProps} />}
          {active === 'loan_req'       && <LoanRequirement {...sharedProps} onLoanTypeChange={handleLoanTypeChange} />}
          {active === 'income'         && <IncomeDetails {...sharedProps} />}
          {active === 'financial'      && <FinancialDetails {...sharedProps} />}
          {active === 'collateral'     && <CollateralDetails {...sharedProps} loanType={loanType} />}
          {active === 'non_collateral' && <NonCollateralDetails {...sharedProps} loanType={loanType} />}
          {active === 'eligibility'    && <EligibilityAssessment applicationId={applicationId} onNavigate={navigate} />}
          {active === 'documents'      && <DocumentUpload {...sharedProps} />}
          {active === 'loan_pref'      && <LoanPreferences {...sharedProps} />}
          {active === 'review'         && <ReviewApplication {...sharedProps} />}
          {active === 'submit'         && <ReviewApplication {...sharedProps} submitMode />}
          {active === 'status'         && <ApplicationStatus applicationId={applicationId} />}
          {active === 'notifications'  && <Notifications onRead={() => loadUnread(user?.id ?? '')} />}
          {active === 'appointments'   && <Appointments />}
          {active === 'profile'        && <ProfileSettings user={user} />}
          {active === 'settings'       && <SettingsPage />}
          {active === 'help'           && <HelpSupport onNavigate={navigate} />}
        </main>
      </div>
    </div>
  );
}
