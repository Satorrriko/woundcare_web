// frontend/src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { apiService } from '../services/api';

const Nav = styled.div`
  background: #15171c;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const SidebarNav = styled.nav`
  background: #15171c;
  width: 250px;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 0;
  left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
  transition: 350ms;
  z-index: 10;
`;

const SidebarWrap = styled.div`
  width: 100%;
`;

const LoadingMessage = styled.div`
  color: white;
  padding: 20px;
  text-align: center;
`;

// frontend/src/components/Sidebar.js
// ... (previous imports remain the same)

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(true);
  const [sidebarData, setSidebarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const patientIds = await apiService.getPatients();
      // 直接存储患者ID数组
      localStorage.setItem('patientIds', JSON.stringify(patientIds));
      setSidebarData(SidebarData());
    } catch (error) {
      console.error('Error fetching patients:', error);
      localStorage.setItem('patientIds', JSON.stringify([]));
      setSidebarData(SidebarData());
    } finally {
      setLoading(false);
    }
  };

  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
      <IconContext.Provider value={{ color: '#fff' }}>
        <Nav>
          <NavIcon to='#'>
            <FaIcons.FaBars onClick={showSidebar} />
          </NavIcon>
        </Nav>
        <SidebarNav sidebar={sidebar}>
          <SidebarWrap>
            <NavIcon to='#'>
              <AiIcons.AiOutlineClose onClick={showSidebar} />
            </NavIcon>
            {loading ? (
              <LoadingMessage>Loading...</LoadingMessage>
            ) : (
              sidebarData.map((item, index) => {
                return <SubMenu item={item} key={index} />;
              })
            )}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;