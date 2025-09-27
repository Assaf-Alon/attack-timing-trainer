import { useState } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { SimonSimulator } from './components/SimonSimulator';
import { PatternEditor } from './components/PatternEditor';

function App() {
  const [activeTab, setActiveTab] = useState('simon-simulator');

  const tabs = [
    {
      id: 'simon-simulator',
      label: '🎮 Training Mode',
      content: <SimonSimulator />
    },
    {
      id: 'pattern-editor',
      label: '⚙️ Pattern Editor',
      content: <PatternEditor />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Boss Attack Timing Trainer
        </h1>
        
        <TabNavigation 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;
