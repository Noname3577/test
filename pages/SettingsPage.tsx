import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

const SettingsPage: React.FC = () => {
    const { exportData, importData } = useAppContext();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleImportClick = () => {
        if (selectedFile) {
            setIsConfirmImportOpen(true);
        }
    };

    const handleConfirmImport = async () => {
        if (selectedFile) {
            await importData(selectedFile);
        }
        setIsConfirmImportOpen(false);
        setSelectedFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                            <DocumentArrowDownIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4 flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">ส่งออกข้อมูล</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                สำรองข้อมูลทั้งหมดของคุณ (งานซ่อม, ลูกค้า, ช่างเทคนิค, อะไหล่) เป็นไฟล์ JSON ไฟล์เดียวเพื่อเก็บไว้หรือย้ายไปยังระบบอื่น
                            </p>
                            <button
                                onClick={exportData}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                ส่งออกข้อมูลทั้งหมด
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                             <DocumentArrowUpIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4 flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">นำเข้าข้อมูล</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                กู้คืนข้อมูลจากไฟล์สำรอง JSON (.json)
                            </p>
                             <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-4">
                               คำเตือน: การดำเนินการนี้จะลบข้อมูลที่มีอยู่ทั้งหมดและแทนที่ด้วยข้อมูลจากไฟล์ที่นำเข้า
                            </p>
                            
                            <div className="flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button 
                                    onClick={triggerFileSelect}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    {selectedFile ? 'เปลี่ยนไฟล์...' : 'เลือกไฟล์...'}
                                </button>
                                {selectedFile && <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">{selectedFile.name}</span>}
                            </div>
                            
                            <button
                                onClick={handleImportClick}
                                disabled={!selectedFile}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-800"
                            >
                                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                                นำเข้าข้อมูล
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmImportOpen}
                onClose={() => setIsConfirmImportOpen(false)}
                onConfirm={handleConfirmImport}
                title="ยืนยันการนำเข้าข้อมูล"
                message="คุณแน่ใจหรือไม่ว่าต้องการนำเข้าข้อมูลจากไฟล์นี้? ข้อมูลปัจจุบันทั้งหมดในระบบจะถูกลบและแทนที่อย่างถาวร การกระทำนี้ไม่สามารถย้อนกลับได้"
            />
        </>
    );
};

export default SettingsPage;