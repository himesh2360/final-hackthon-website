import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiChevronLeft, FiChevronRight, FiCamera } from 'react-icons/fi';
import IssueCard from '../components/issues/IssueCard';
import LeftSidebar from '../components/layout/LeftSidebar';
import RightSidebar from '../components/layout/RightSidebar';
import { issuesAPI, analyticsAPI, upvotesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Indian States with detailed issue data (Static)
const INDIAN_STATES_DATA = [
  { name: 'Maharashtra', issues: 145, emoji: '🏛️', resolved: 234, inProgress: 45, cities: ['Mumbai', 'Pune', 'Nagpur'] },
  { name: 'Delhi', issues: 98, emoji: '🏙️', resolved: 156, inProgress: 32, cities: ['New Delhi', 'Dwarka', 'Rohini'] },
  { name: 'Karnataka', issues: 67, emoji: '🌴', resolved: 189, inProgress: 23, cities: ['Bangalore', 'Mysore', 'Hubli'] },
  { name: 'Tamil Nadu', issues: 54, emoji: '🛕', resolved: 167, inProgress: 18, cities: ['Chennai', 'Coimbatore', 'Madurai'] },
  { name: 'Uttar Pradesh', issues: 189, emoji: '🕌', resolved: 312, inProgress: 67, cities: ['Lucknow', 'Kanpur', 'Varanasi'] },
  { name: 'Gujarat', issues: 0, emoji: '🦁', resolved: 145, inProgress: 0, cities: ['Ahmedabad', 'Surat', 'Vadodara'] },
  { name: 'Rajasthan', issues: 43, emoji: '🏰', resolved: 98, inProgress: 15, cities: ['Jaipur', 'Jodhpur', 'Udaipur'] },
  { name: 'West Bengal', issues: 76, emoji: '🌸', resolved: 134, inProgress: 28, cities: ['Kolkata', 'Howrah', 'Siliguri'] },
  { name: 'Kerala', issues: 0, emoji: '🥥', resolved: 178, inProgress: 0, cities: ['Kochi', 'Trivandrum', 'Kozhikode'] },
  { name: 'Telangana', issues: 89, emoji: '💎', resolved: 145, inProgress: 34, cities: ['Hyderabad', 'Warangal', 'Nizamabad'] },
  { name: 'Punjab', issues: 32, emoji: '🌾', resolved: 87, inProgress: 12, cities: ['Chandigarh', 'Ludhiana', 'Amritsar'] },
  { name: 'Haryana', issues: 0, emoji: '🏏', resolved: 76, inProgress: 0, cities: ['Gurgaon', 'Faridabad', 'Panipat'] },
  { name: 'Madhya Pradesh', issues: 67, emoji: '🐅', resolved: 112, inProgress: 24, cities: ['Bhopal', 'Indore', 'Gwalior'] },
  { name: 'Bihar', issues: 112, emoji: '📚', resolved: 89, inProgress: 45, cities: ['Patna', 'Gaya', 'Muzaffarpur'] },
  { name: 'Odisha', issues: 0, emoji: '🛶', resolved: 98, inProgress: 0, cities: ['Bhubaneswar', 'Cuttack', 'Puri'] },
  { name: 'Andhra Pradesh', issues: 45, emoji: '🎭', resolved: 123, inProgress: 17, cities: ['Visakhapatnam', 'Vijayawada', 'Tirupati'] },
  { name: 'Jharkhand', issues: 28, emoji: '⛏️', resolved: 67, inProgress: 10, cities: ['Ranchi', 'Jamshedpur', 'Dhanbad'] },
  { name: 'Assam', issues: 0, emoji: '🍵', resolved: 54, inProgress: 0, cities: ['Guwahati', 'Silchar', 'Dibrugarh'] },
  { name: 'Chhattisgarh', issues: 19, emoji: '🌲', resolved: 45, inProgress: 7, cities: ['Raipur', 'Bilaspur', 'Durg'] },
  { name: 'Goa', issues: 0, emoji: '🏖️', resolved: 89, inProgress: 0, cities: ['Panaji', 'Margao', 'Vasco'] },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    state: '',
    sort: 'newest'
  });

  const loadData = useCallback(async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        issuesAPI.getAll({ limit: 8 }),
        analyticsAPI.getOverview().catch(() => ({ data: { stats: null } }))
      ]);
      setRecentIssues(issuesRes.data.issues);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpvote = useCallback(async (issueId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const response = await upvotesAPI.toggle(issueId);
      setRecentIssues(prev => prev.map(issue =>
        issue._id === issueId
          ? { ...issue, upvoteCount: response.data.upvoteCount, hasUpvoted: response.data.upvoted }
          : issue
      ));
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  }, [isAuthenticated]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const counts = useMemo(() => ({
    resolved: stats?.byStatus?.resolved || 1240,
    active: stats?.byStatus?.reported || 86,
    inProgress: stats?.byStatus?.inProgress || 32
  }), [stats]);

  // State for modal popup
  const [selectedState, setSelectedState] = useState(null);

  // Handle state click
  const handleStateClick = useCallback((state) => {
    if (state.issues === 0) {
      setSelectedState({ ...state, noIssues: true });
    } else {
      setSelectedState(state);
    }
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setSelectedState(null);
  }, []);

  return (
    <>
      <style>{`
        .home-layout {
          display: flex;
          min-height: calc(100vh - 72px);
          margin-top: 72px;
        }
        
        .home-main {
          flex: 1;
          margin-left: 280px;
          margin-right: ${sidebarOpen ? '320px' : '0px'};
          transition: margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          /* Dark India Map Background */
          background: 
            linear-gradient(180deg, 
              rgba(8, 12, 21, 0.85) 0%, 
              rgba(8, 12, 21, 0.75) 30%,
              rgba(8, 12, 21, 0.80) 70%, 
              rgba(8, 12, 21, 0.92) 100%
            ),
            url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/4/11/6.png'),
            url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/4/12/6.png'),
            url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/4/11/7.png'),
            url('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/4/12/7.png'),
            linear-gradient(135deg, #080c15 0%, #0d1520 50%, #0a0f18 100%);
          background-size: cover, 50% 50%, 50% 50%, 50% 50%, 50% 50%, cover;
          background-position: center, 0% 0%, 50% 0%, 0% 50%, 50% 50%, center;
          background-repeat: no-repeat, no-repeat, no-repeat, no-repeat, no-repeat, no-repeat;
          background-attachment: fixed;
          min-height: 100%;
          overflow-x: hidden;
          position: relative;
          will-change: margin-right;
        }
        
        /* Dark blue glow overlay */
        .home-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse 80% 60% at 50% 35%, rgba(30, 64, 120, 0.25) 0%, transparent 70%),
            radial-gradient(circle at 25% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
          animation: glowMove 15s ease-in-out infinite alternate;
        }
        
        @keyframes glowMove {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.85; }
        }
        
        /* Animated Map Pin Markers */
        .home-main::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            /* Major cities - larger glowing pins */
            radial-gradient(circle at 28% 28%, rgba(59, 130, 246, 0.9) 0px, rgba(59, 130, 246, 0.3) 5px, transparent 8px),
            radial-gradient(circle at 45% 38%, rgba(16, 185, 129, 0.9) 0px, rgba(16, 185, 129, 0.3) 5px, transparent 8px),
            radial-gradient(circle at 62% 32%, rgba(245, 158, 11, 0.9) 0px, rgba(245, 158, 11, 0.3) 5px, transparent 8px),
            radial-gradient(circle at 52% 52%, rgba(59, 130, 246, 0.9) 0px, rgba(59, 130, 246, 0.3) 5px, transparent 8px),
            radial-gradient(circle at 35% 62%, rgba(16, 185, 129, 0.9) 0px, rgba(16, 185, 129, 0.3) 5px, transparent 8px),
            /* Secondary cities - medium pins */
            radial-gradient(circle at 40% 25%, rgba(59, 130, 246, 0.6) 0px, transparent 4px),
            radial-gradient(circle at 55% 28%, rgba(16, 185, 129, 0.6) 0px, transparent 4px),
            radial-gradient(circle at 68% 45%, rgba(139, 92, 246, 0.6) 0px, transparent 4px),
            radial-gradient(circle at 25% 48%, rgba(245, 158, 11, 0.6) 0px, transparent 4px),
            radial-gradient(circle at 48% 68%, rgba(59, 130, 246, 0.6) 0px, transparent 4px),
            radial-gradient(circle at 58% 58%, rgba(16, 185, 129, 0.6) 0px, transparent 4px),
            /* Small towns - subtle pins */
            radial-gradient(circle at 32% 35%, rgba(59, 130, 246, 0.4) 0px, transparent 3px),
            radial-gradient(circle at 72% 55%, rgba(16, 185, 129, 0.4) 0px, transparent 3px),
            radial-gradient(circle at 22% 58%, rgba(139, 92, 246, 0.4) 0px, transparent 3px),
            radial-gradient(circle at 65% 68%, rgba(245, 158, 11, 0.4) 0px, transparent 3px);
          pointer-events: none;
          z-index: 0;
          animation: pinsGlow 4s ease-in-out infinite;
          will-change: opacity;
        }
        
        @keyframes pinsGlow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        
        .home-main > * {
          position: relative;
          z-index: 1;
        }
        
        /* ===== FLOATING POPUP CARD - SMOOTH POP-UP FROM BOTTOM ===== */
        .popup-card {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 28px;
          padding: ${sidebarOpen ? '40px' : '50px 60px'};
          max-width: ${sidebarOpen ? '650px' : '900px'};
          margin: ${sidebarOpen ? '50px auto 40px' : '60px auto 50px'};
          box-shadow: 
            0 0 100px rgba(59, 130, 246, 0.25),
            0 35px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          animation: popUpFromBottom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        @keyframes popUpFromBottom {
          0% { 
            opacity: 0; 
            transform: translateY(80px) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.02);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        
        .popup-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 12px;
        }
        
        .popup-icon {
          font-size: ${sidebarOpen ? '3rem' : '4rem'};
          transition: font-size 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: iconBounce 0.8s ease-out 0.3s;
        }
        
        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        /* ===== GLOWING TITLE EFFECT - BIGGER ===== */
        .popup-title {
          font-size: ${sidebarOpen ? '3rem' : '4rem'};
          font-weight: 900;
          margin: 0;
          color: #f8fafc;
          letter-spacing: -0.02em;
          text-shadow: 
            0 0 15px rgba(248, 250, 252, 0.6),
            0 0 30px rgba(248, 250, 252, 0.4),
            0 0 50px rgba(59, 130, 246, 0.4),
            0 0 80px rgba(59, 130, 246, 0.3);
          animation: glowPulse 3s ease-in-out infinite, fadeInTitle 0.8s ease-out 0.2s both;
          transition: font-size 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.3s ease;
        }
        
        @keyframes glowPulse {
          0%, 100% { 
            text-shadow: 
              0 0 10px rgba(248, 250, 252, 0.5),
              0 0 20px rgba(248, 250, 252, 0.3),
              0 0 40px rgba(59, 130, 246, 0.3),
              0 0 60px rgba(59, 130, 246, 0.2);
          }
          50% { 
            text-shadow: 
              0 0 15px rgba(248, 250, 252, 0.7),
              0 0 30px rgba(248, 250, 252, 0.5),
              0 0 50px rgba(59, 130, 246, 0.5),
              0 0 80px rgba(59, 130, 246, 0.4);
          }
        }
        
        @keyframes fadeInTitle {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .popup-subtitle {
          color: #94a3b8;
          font-size: ${sidebarOpen ? '1rem' : '1.2rem'};
          margin: 0 0 32px 0;
          text-align: center;
          transition: font-size 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: fadeInTitle 0.8s ease-out 0.4s both;
        }
        
        /* ===== STATUS CARDS GRID ===== */
        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: ${sidebarOpen ? '18px' : '28px'};
          transition: gap 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .status-card {
          background: rgba(15, 23, 42, 0.9);
          border-radius: 20px;
          padding: ${sidebarOpen ? '24px 18px' : '32px 24px'};
          text-align: center;
          border: 2px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          animation: cardSlideUp 0.6s ease-out both;
        }
        
        .status-card:nth-child(1) { animation-delay: 0.5s; }
        .status-card:nth-child(2) { animation-delay: 0.65s; }
        .status-card:nth-child(3) { animation-delay: 0.8s; }
        
        @keyframes cardSlideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        
        .status-card:hover {
          transform: translateY(-10px) scale(1.03);
        }
        
        .status-card.green { 
          border-color: rgba(16, 185, 129, 0.5);
          background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(15, 23, 42, 0.9));
        }
        .status-card.green:hover { 
          box-shadow: 0 20px 60px rgba(16, 185, 129, 0.4);
          border-color: rgba(16, 185, 129, 0.9);
        }
        
        .status-card.yellow { 
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(145deg, rgba(245, 158, 11, 0.15), rgba(15, 23, 42, 0.9));
        }
        .status-card.yellow:hover { 
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.4);
          border-color: rgba(245, 158, 11, 0.9);
        }
        
        .status-card.blue { 
          border-color: rgba(59, 130, 246, 0.5);
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0.9));
        }
        .status-card.blue:hover { 
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.35);
          border-color: rgba(59, 130, 246, 0.8);
        }
        
        .status-emoji {
          font-size: ${sidebarOpen ? '2.5rem' : '3.5rem'};
          display: block;
          margin-bottom: 12px;
          transition: font-size 0.5s ease;
        }
        
        .status-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: ${sidebarOpen ? '0.95rem' : '1.1rem'};
          font-weight: 700;
          margin-bottom: 10px;
          transition: font-size 0.5s ease;
        }
        
        .status-label.green { color: #10B981; }
        .status-label.yellow { color: #F59E0B; }
        .status-label.blue { color: #3B82F6; }
        
        .status-count {
          font-size: ${sidebarOpen ? '2.8rem' : '3.5rem'};
          font-weight: 900;
          color: #f1f5f9;
          line-height: 1;
          margin-bottom: 8px;
          transition: font-size 0.5s ease;
        }
        
        .status-desc {
          font-size: ${sidebarOpen ? '0.8rem' : '0.95rem'};
          color: #64748b;
          transition: font-size 0.5s ease;
        }
        
        /* ===== RED TOGGLE BUTTON - OPTIMIZED ===== */
        .toggle-btn {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          width: 36px;
          height: 90px;
          background: linear-gradient(180deg, #EF4444 0%, #B91C1C 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          box-shadow: -4px 0 20px rgba(239, 68, 68, 0.5);
          transition: right 0.3s ease-out, width 0.2s ease;
          will-change: right;
        }
        
        .toggle-btn.open {
          right: 320px;
          border-radius: 14px 0 0 14px;
        }
        
        .toggle-btn.closed {
          right: 0;
          border-radius: 0 14px 14px 0;
        }
        
        .toggle-btn:hover {
          width: 44px;
        }
        
        /* ===== RIGHT SIDEBAR - GPU ACCELERATED ===== */
        .right-sidebar {
          position: fixed;
          top: 72px;
          right: 0;
          bottom: 0;
          width: 320px;
          background: #0f172a;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          overflow-y: auto;
          padding: 24px 16px;
          z-index: 100;
          transform: translateX(0);
          transition: transform 0.3s ease-out;
          will-change: transform;
        }
        
        .right-sidebar.open {
          transform: translateX(0);
        }
        
        .right-sidebar.closed {
          transform: translateX(100%);
        }
        
        /* ===== ISSUES SECTION ===== */
        .issues-section {
          padding: 30px 50px 60px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .issues-grid {
          display: grid;
          grid-template-columns: ${sidebarOpen ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'};
          gap: 28px;
          transition: grid-template-columns 0.5s ease;
        }
        
        /* ===== REPORT ISSUE CTA ===== */
        .report-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 50px 30px;
          margin: 30px 50px;
          background: rgba(30, 41, 59, 0.6);
          border: 2px dashed rgba(239, 68, 68, 0.5);
          border-radius: 24px;
          text-decoration: none;
          transition: all 0.4s ease;
        }
        
        .report-cta:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.8);
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(239, 68, 68, 0.2);
        }
        
        .report-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #EF4444, #B91C1C);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: white;
          margin-bottom: 18px;
          box-shadow: 0 10px 40px rgba(239, 68, 68, 0.5);
        }
        
        .report-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f1f5f9;
        }
        
        /* ===== EMPTY STATE ===== */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #64748b;
        }
        
        .empty-icon {
          font-size: 5rem;
          margin-bottom: 20px;
        }
        
        /* ===== STATE TICKER MARQUEE ===== */
        .state-ticker-section {
          margin: 20px 40px 30px;
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          padding: 16px 0;
        }
        
        .ticker-header {
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 12px;
          font-weight: 600;
        }
        
        .ticker-wrapper {
          overflow: hidden;
          position: relative;
        }
        
        .ticker-wrapper::before,
        .ticker-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
        }
        
        .ticker-wrapper::before {
          left: 0;
          background: linear-gradient(90deg, rgba(15, 23, 42, 1) 0%, transparent 100%);
        }
        
        .ticker-wrapper::after {
          right: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(15, 23, 42, 1) 100%);
        }
        
        .ticker-track {
          display: flex;
          animation: scroll 40s linear infinite;
          width: fit-content;
        }
        
        .ticker-track:hover {
          animation-play-state: paused;
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .state-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          margin: 0 8px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        
        .state-item:hover {
          transform: scale(1.05);
        }
        
        .state-item.critical {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
        
        .state-item.warning {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08));
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        
        .state-item.solved {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        
        .state-emoji {
          font-size: 1.2rem;
        }
        
        .state-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f1f5f9;
        }
        
        .state-count {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 8px;
        }
        
        .state-count.critical {
          background: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }
        
        .state-count.warning {
          background: rgba(245, 158, 11, 0.3);
          color: #F59E0B;
        }
        
        .state-count.solved {
          background: rgba(16, 185, 129, 0.3);
          color: #10B981;
        }
        
        /* ===== STATE MODAL POPUP ===== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 2px solid rgba(59, 130, 246, 0.4);
          border-radius: 24px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        
        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
        }
        
        .modal-emoji {
          font-size: 2rem;
        }
        
        .modal-close {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .modal-close:hover {
          background: rgba(239, 68, 68, 0.4);
          transform: rotate(90deg);
        }
        
        .modal-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .modal-stat {
          text-align: center;
          padding: 16px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .modal-stat.active { border: 1px solid rgba(245, 158, 11, 0.4); }
        .modal-stat.progress { border: 1px solid rgba(59, 130, 246, 0.4); }
        .modal-stat.resolved { border: 1px solid rgba(16, 185, 129, 0.4); }
        
        .modal-stat-value {
          font-size: 2rem;
          font-weight: 900;
          margin-bottom: 4px;
        }
        
        .modal-stat.active .modal-stat-value { color: #F59E0B; }
        .modal-stat.progress .modal-stat-value { color: #3B82F6; }
        .modal-stat.resolved .modal-stat-value { color: #10B981; }
        
        .modal-stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }
        
        .modal-cities {
          margin-top: 16px;
        }
        
        .modal-cities-title {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 12px;
        }
        
        .modal-cities-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .modal-city-tag {
          padding: 6px 14px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 20px;
          font-size: 0.85rem;
          color: #93c5fd;
        }
        
        .modal-no-issues {
          text-align: center;
          padding: 40px 20px;
        }
        
        .modal-no-issues-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }
        
        .modal-no-issues-text {
          font-size: 1.2rem;
          color: #10B981;
          font-weight: 600;
        }
        
        .modal-no-issues-sub {
          font-size: 0.9rem;
          color: #64748b;
          margin-top: 8px;
        }
        
        /* ===== TABLET BREAKPOINT ===== */
        @media (max-width: 1200px) {
          .issues-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        /* ===== MOBILE BREAKPOINT ===== */
        @media (max-width: 900px) {
          .home-layout {
            display: block;
          }
          
          .home-main {
            margin-left: 0 !important;
            margin-right: 0 !important;
            min-height: calc(100vh - 64px);
          }
          
          .status-grid {
            grid-template-columns: 1fr;
          }
          
          .issues-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .popup-card {
            margin: 20px 16px !important;
            padding: 24px 20px !important;
            max-width: 100% !important;
          }
          
          .popup-title {
            font-size: 1.75rem !important;
          }
          
          .popup-subtitle {
            font-size: 0.9rem !important;
          }
          
          .popup-icon {
            width: 56px !important;
            height: 56px !important;
          }
          
          .state-ticker-section {
            margin: 16px !important;
            padding: 16px !important;
          }
          
          .modal-stats {
            grid-template-columns: 1fr;
          }
          
          .modal-content {
            width: 95% !important;
            padding: 20px !important;
            max-height: 85vh;
          }
          
          .issues-section {
            padding: 20px 16px 40px !important;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          
          .report-cta {
            margin: 20px 16px !important;
            padding: 30px 20px !important;
          }
        }
        
        /* ===== SMALL MOBILE BREAKPOINT ===== */
        @media (max-width: 480px) {
          .popup-card {
            margin: 12px !important;
            padding: 20px 16px !important;
          }
          
          .popup-title {
            font-size: 1.4rem !important;
          }
          
          .popup-icon {
            width: 48px !important;
            height: 48px !important;
            font-size: 1.5rem !important;
          }
          
          .status-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          
          .status-card {
            padding: 12px !important;
          }
          
          .status-count {
            font-size: 1.25rem !important;
          }
          
          .status-label {
            font-size: 0.65rem !important;
          }
          
          .state-ticker-section {
            margin: 12px !important;
            padding: 14px !important;
          }
          
          .ticker-heading {
            font-size: 0.9rem !important;
          }
          
          .issues-section {
            padding: 16px 12px 30px !important;
          }
          
          .section-title {
            font-size: 1.1rem !important;
          }
          
          .modal-content {
            border-radius: 16px !important;
            padding: 16px !important;
          }
          
          .modal-title {
            font-size: 1.2rem !important;
          }
          
          .modal-emoji {
            font-size: 1.5rem !important;
          }
          
          .modal-stat-value {
            font-size: 1.5rem !important;
          }
        }
      `}</style>

      <div className="home-layout">
        {/* Left Sidebar */}
        <LeftSidebar filters={filters} onFilterChange={handleFilterChange} />

        {/* Main Content - Expands when sidebar closes */}
        <main className="home-main">

          {/* ===== FLOATING POPUP CARD - BIGGER AND EXPANDS ===== */}
          <div className="popup-card">
            <div className="popup-header">
              <span className="popup-icon">🏙️</span>
              <h1 className="popup-title">Better My City</h1>
            </div>
            <p className="popup-subtitle">Report, track, and resolve city issues faster</p>

            {/* 3 Status Cards */}
            <div className="status-grid">
              {/* Resolved - Green */}
              <div className="status-card green">
                <span className="status-emoji">✅</span>
                <div className="status-label green">Resolved Issues 💚</div>
                <div className="status-count">{counts.resolved.toLocaleString()}</div>
                <div className="status-desc">Successfully fixed</div>
              </div>

              {/* Active - Yellow */}
              <div className="status-card yellow">
                <span className="status-emoji">🔔</span>
                <div className="status-label yellow">Active Issues 💛</div>
                <div className="status-count">{counts.active}</div>
                <div className="status-desc">Currently reported</div>
              </div>

              {/* In Progress - Blue */}
              <div className="status-card blue">
                <span className="status-emoji">🚧</span>
                <div className="status-label blue">In Progress 💙</div>
                <div className="status-count">{counts.inProgress}</div>
                <div className="status-desc">Being worked on</div>
              </div>
            </div>
          </div>

          {/* ===== STATE TICKER - RUNNING LINE ===== */}
          <div className="state-ticker-section">
            <div className="ticker-header">
              📊 Live Issues Across Indian States (Click for details)
            </div>
            <div className="ticker-wrapper">
              <div className="ticker-track">
                {/* First set of states */}
                {INDIAN_STATES_DATA.map((state, idx) => {
                  const status = state.issues === 0 ? 'solved' : state.issues > 100 ? 'critical' : 'warning';
                  return (
                    <div
                      key={idx}
                      className={`state-item ${status}`}
                      onClick={() => handleStateClick(state)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="state-emoji">{state.emoji}</span>
                      <span className="state-name">{state.name}</span>
                      <span className={`state-count ${status}`}>
                        {state.issues === 0
                          ? '✓ All Solved'
                          : state.issues > 100
                            ? `${state.issues}++`
                            : state.issues}
                      </span>
                    </div>
                  );
                })}
                {/* Duplicate for seamless loop */}
                {INDIAN_STATES_DATA.map((state, idx) => {
                  const status = state.issues === 0 ? 'solved' : state.issues > 100 ? 'critical' : 'warning';
                  return (
                    <div
                      key={`dup-${idx}`}
                      className={`state-item ${status}`}
                      onClick={() => handleStateClick(state)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="state-emoji">{state.emoji}</span>
                      <span className="state-name">{state.name}</span>
                      <span className={`state-count ${status}`}>
                        {state.issues === 0
                          ? '✓ All Solved'
                          : state.issues > 100
                            ? `${state.issues}++`
                            : state.issues}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== REPORT ISSUE CTA ===== */}
          <Link to="/create-issue" className="report-cta">
            <div className="report-icon">
              <FiCamera />
            </div>
            <span className="report-text">Report an Issue</span>
          </Link>

          {/* ===== RECENT ISSUES WITH PHOTOS ===== */}
          <section className="issues-section">
            <div className="section-header">
              <h2 className="section-title">
                📸 Recently Reported Issues
              </h2>
              <Link to="/issues" className="btn btn-outline btn-sm">View All</Link>
            </div>

            {loading ? (
              <div className="issues-grid">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card">
                    <div className="skeleton" style={{ height: '180px' }}></div>
                    <div className="card-body">
                      <div className="skeleton" style={{ height: '20px', marginBottom: '10px' }}></div>
                      <div className="skeleton" style={{ height: '50px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentIssues.length > 0 ? (
              <div className="issues-grid">
                {recentIssues.map((issue) => (
                  <IssueCard key={issue._id} issue={issue} onUpvote={handleUpvote} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 style={{ fontSize: '1.8rem', color: '#f1f5f9', marginBottom: '12px' }}>No issues reported yet</h3>
                <p style={{ fontSize: '1.1rem' }}>Be the first to report a civic issue in your area!</p>
              </div>
            )}
          </section>
        </main>

        {/* ===== RED TOGGLE BUTTON ===== */}
        <button
          className={`toggle-btn ${sidebarOpen ? 'open' : 'closed'}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        {/* ===== RIGHT SIDEBAR - FULLY HIDDEN WHEN CLOSED ===== */}
        <aside className={`right-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <RightSidebar stats={stats} />
        </aside>
      </div>

      {/* ===== STATE DETAIL MODAL ===== */}
      {selectedState && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-emoji">{selectedState.emoji}</span>
                {selectedState.name}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {selectedState.noIssues ? (
              <div className="modal-no-issues">
                <div className="modal-no-issues-icon">🎉</div>
                <div className="modal-no-issues-text">All Issues Resolved!</div>
                <div className="modal-no-issues-sub">
                  No pending issues in {selectedState.name}. Great work, citizens!
                </div>
                <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px' }}>
                  <div style={{ color: '#10B981', fontWeight: '700', fontSize: '1.5rem' }}>
                    {selectedState.resolved} issues resolved ✓
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-stats">
                  <div className="modal-stat active">
                    <div className="modal-stat-value">{selectedState.issues}</div>
                    <div className="modal-stat-label">🔔 Active Issues</div>
                  </div>
                  <div className="modal-stat progress">
                    <div className="modal-stat-value">{selectedState.inProgress}</div>
                    <div className="modal-stat-label">🚧 In Progress</div>
                  </div>
                  <div className="modal-stat resolved">
                    <div className="modal-stat-value">{selectedState.resolved}</div>
                    <div className="modal-stat-label">✅ Resolved</div>
                  </div>
                </div>

                <div className="modal-cities">
                  <div className="modal-cities-title">📍 Affected Cities:</div>
                  <div className="modal-cities-list">
                    {selectedState.cities.map((city, idx) => (
                      <span key={idx} className="modal-city-tag">{city}</span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/issues?state=${selectedState.name}`}
                  style={{
                    display: 'block',
                    marginTop: '24px',
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={closeModal}
                >
                  View All Issues in {selectedState.name} →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
