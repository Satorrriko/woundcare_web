import React from 'react';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as RiIcons from 'react-icons/ri';

export const SidebarData = () => {
  // Retrieve patient data from local storage
  const storedPatients = localStorage.getItem('patientIds');
  const patientIds = storedPatients ? JSON.parse(storedPatients) : [];

  return [
    {
      title: 'Overview',
      path: '/overview',
      icon: <AiIcons.AiFillHome />,
      iconClosed: <RiIcons.RiArrowDownSFill />,
      iconOpened: <RiIcons.RiArrowUpSFill />,
      subNav: [
        {
          title: 'Reports',
          path: '/overview/reports',
          icon: <IoIcons.IoMdPaper />,
        },
        {
          title: 'Statistics',
          path: '/overview/statistics',
          icon: <IoIcons.IoIosStats />
        }
      ]
    },
    {
      title: 'Patients',
      path: '/patients',
      icon: <IoIcons.IoMdPeople />,
      iconClosed: <RiIcons.RiArrowDownSFill />,
      iconOpened: <RiIcons.RiArrowUpSFill />,
      subNav: patientIds.map(id => ({
        title: `${id}`,
        path: `/patients/${id}`,
        icon: <IoIcons.IoIosPerson />
      }))
    },
    {
      title: 'Support',
      path: '/support',
      icon: <IoIcons.IoMdHelpCircle />
    }
  ];
};