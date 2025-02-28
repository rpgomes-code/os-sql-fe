'use client';

import { useState } from 'react';
import AuthProvider from '@/components/AuthProvider';
import SqlConverter from '@/components/SqlConverter';
import LogsViewer from '@/components/LogsViewer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('converter');

  return (
      <AuthProvider>
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                  onClick={() => setActiveTab('converter')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'converter'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                SQL Converter
              </button>
              <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'logs'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                System Logs
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'converter' ? <SqlConverter /> : <LogsViewer />}
      </AuthProvider>
  );
}