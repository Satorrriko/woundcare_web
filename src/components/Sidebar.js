import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import SubMenu from './SubMenu';
import { IconContext } from 'react-icons/lib';
import AWS from 'aws-sdk';
import React, { useState, useEffect } from 'react';


// Configure the AWS SDK with your credentials and region
AWS.config.update({
  region: 'ap-southeast-2', // Replace with your bucket's region
  credentials: new AWS.Credentials(
    'AKIAQKGGXM7RYAIFTVDD',
    'vGN7vNDPgjg1wwGYEJ2FdhysUe0s+XH9vtU25gwA'
  ),
});

const s3 = new AWS.S3();

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

const Sidebar = () => {
  const [sidebar, setSidebar] = useState(true);
  const [sidebarData, setSidebarData] = useState([]);

  useEffect(() => {
    fetchPatientIds();
    setSidebarData(SidebarData());
  }, []);  // No dependency to fetch only on component mount

  const fetchPatientIds = async () => {
    const params = {
      Bucket: 'test12345464',
    };

    try {
      const data = await s3.listObjectsV2(params).promise();

      const patients = data.Contents.reduce((ac, file) => {
        const relativePath = file.Key.replace('images/', '');
        const parts = relativePath.split('_');
        const pId = parts[0];
        ac.add(pId);
        return ac;
    }, new Set());
      localStorage.setItem('patientIds', JSON.stringify(Array.from(patients)));
    } catch (err) {
      console.error('Error fetching files:', err);
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
            {sidebarData.map((item, index) => {
              return <SubMenu item={item} key={index} />;
            })}
          </SidebarWrap>
        </SidebarNav>
      </IconContext.Provider>
    </>
  );
};

export default Sidebar;
