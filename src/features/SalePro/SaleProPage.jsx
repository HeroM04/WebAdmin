import React, { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';

export const SaleProPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div style={{ padding: '0 16px' }}>
      {!selectedProject ? (
        <ProjectList onSelectProject={setSelectedProject} />
      ) : (
        <ProjectDetail 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
};
