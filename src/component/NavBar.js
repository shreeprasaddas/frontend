import {useState, useRef, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './nav.css';
import MenuCard from './menu_card';
import './menu_button.css'
import searchService from '../services/searchService';

let menuClick;
export function menuClose(){
  menuClick();
  
}


export default function NavBar(){
  const [isMobile,setMobile]= useState(window.innerWidth < 768? true:false);
  const [triggerVal, setTrig]= useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

    
     
     menuClick= function(){
      if(isMobile){
        setTrig(false);
      }
      
     }
     function trig(){
     setTrig(!triggerVal);
     
     }

  useEffect(() => {
    function checkScreen() {
      setMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []); // runs once on mount, cleans up on unmount

  // Debounced search function
  const debouncedSearch = useRef(searchService.createDebouncedSearch(300)).current;

  // Handle search input change
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const result = await debouncedSearch(query, { limit: 5 });
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (project) => {
    setShowSearchResults(false);
    setSearchQuery('');
    // Navigate to portfolio page with the project highlighted
    navigate('/portfolio', { state: { highlightProject: project.tittle } });
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      navigate('/portfolio', { state: { searchQuery: searchQuery.trim() } });
      setSearchQuery('');
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  

   const nav3dLogo= ()=>{
    return(
      <spline-viewer url="https://prod.spline.design/B6Z0qsiDXXq8DqOw/scene.splinecode" className="slogo" id="nav-logo" />
    )
   }
   
  const Menu =
     <>
       <div className="trigger" id="trigger" onClick={trig}>
         <svg className="bars" viewBox="0 0 100 100">
           <path className="line top" d="m 30,33 h 40 c 13.100415,0 14.380204,31.80258 6.899646,33.421777 -24.612039,5.327373 9.016154,-52.337577 -12.75751,-30.563913 l -28.284272,28.284272" />
           <path className="line middle" d="m 70,50 c 0,0 -32.213436,0 -40,0 -7.786564,0 -6.428571,-4.640244 -6.428571,-8.571429 0,-5.895471 6.073743,-11.783399 12.286435,-5.570707 6.212692,6.212692 28.284272,28.284272 28.284272,28.284272" />
           <path className="line bottom" d="m 69.575405,67.073826 h -40 c -13.100415,0 -14.380204,-31.80258 -6.899646,-33.421777 24.612039,-5.327373 -9.016154,52.337577 12.75751,30.563913 l 28.284272,-28.284272" />
         </svg>
       </div>
  </>
;
  

   const desktopNav=<ul>
   <Link to="/">
      <li className="left-nav">Home</li>
      <div className='nav-hovor'></div>
  
   </Link>
   <Link to="/about"><li className="left-nav about-nav">About Us
    </li>
    <div className='nav-hovor'></div>
    </Link>

   <Link to="/portfolio"> 
   <li className="left-nav portfolio">Portfolio</li>
   <div className='nav-hovor'></div>
   </Link>
   
   <Link to="/solutions">
   <li className="left-nav solutions">Solutions</li>
   <div className='nav-hovor'></div>
   </Link>
   <li className="Search-and-contact">
     <div className="search-container" ref={searchRef}>
       <form onSubmit={handleSearchSubmit}>
         <input 
           type="text" 
           className="search right" 
           placeholder="Search projects..." 
           value={searchQuery}
           onChange={handleSearchChange}
           autoComplete="off"
         />
       </form>
       {showSearchResults && (
         <div className="search-results">
           {isSearching ? (
             <div className="search-loading">Searching...</div>
           ) : searchResults.length > 0 ? (
             <>
               {searchResults.map((project, index) => (
                 <div 
                   key={index} 
                   className="search-result-item"
                   onClick={() => handleSearchResultClick(project)}
                 >
                   <div className="search-result-title">{project.tittle}</div>
                   <div className="search-result-desc">
                     {project.paragraph.substring(0, 80)}...
                   </div>
                 </div>
               ))}
               <div className="search-view-all">
                 <button onClick={() => {
                   navigate('/portfolio', { state: { searchQuery: searchQuery.trim() } });
                   setShowSearchResults(false);
                   setSearchQuery('');
                 }}>
                   View all results
                 </button>
               </div>
             </>
           ) : (
             <div className="search-no-results">No projects found</div>
           )}
         </div>
       )}
     </div>
     <Link to="/contact"><button className="btn conatct-btn right">Contact Us</button></Link>
   </li>
 </ul>;



 const mobileNavPlaceholder = null; // Removed broken inline mobile links because we use MenuCard on mobile

    return(
    <>
    <nav className="main-nav">
        <div className="logo" style={isMobile ? { display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' } : {}}>
             {isMobile ? (
               <>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   {Menu}
                   <Link to="/" style={{ textDecoration: 'none' }}>
                     <span style={{color: '#27CDCD', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: "'Inter', sans-serif"}}>PORTFOLIO</span>
                   </Link>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Link to="/">
                     <button style={{
                       backgroundColor: 'transparent',
                       color: 'white',
                       border: 'none',
                       padding: '6px',
                       fontSize: '12px',
                       cursor: 'pointer',
                       textDecoration: 'none'
                     }}>Home</button>
                   </Link>
                   <Link to="/portfolio">
                     <button style={{
                       backgroundColor: 'transparent',
                       color: '#27CDCD',
                       border: '1px solid rgba(39, 205, 205, 0.5)',
                       borderRadius: '6px',
                       padding: '6px 10px',
                       fontSize: '12px',
                       cursor: 'pointer',
                       textDecoration: 'none'
                     }}>Portfolio</button>
                   </Link>
                 </div>
               </>
             ) : nav3dLogo()}
        </div>
        {!isMobile && desktopNav} 
    </nav>
        {triggerVal?<MenuCard closeMenu={() => setTrig(false)} />:null}
        </>
    )
}


