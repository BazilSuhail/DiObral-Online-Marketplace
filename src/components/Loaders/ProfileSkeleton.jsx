import React from 'react';
import { motion } from "motion/react";

const SkeletonLoader = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const ProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <SkeletonLoader className="h-8 w-48 mb-2" />
                    <SkeletonLoader className="h-4 w-64" />
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        {/* User Info Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="text-center mb-6">
                                <SkeletonLoader className="h-6 w-32 mx-auto mb-2" />
                                <SkeletonLoader className="h-4 w-24 mx-auto" />
                            </div>
                            <div className="space-y-3">
                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
                            <SkeletonLoader className="h-6 w-36 mb-4" />
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <SkeletonLoader className="h-4 w-24" />
                                    <SkeletonLoader className="h-4 w-12" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <SkeletonLoader className="h-4 w-24" />
                                    <SkeletonLoader className="h-4 w-16" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <SkeletonLoader className="h-4 w-24" />
                                    <SkeletonLoader className="h-6 w-20 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white p-8 rounded-xl shadow-md">
                            <div className="flex items-center justify-between mb-8">
                                <SkeletonLoader className="h-6 w-48" />
                                <SkeletonLoader className="h-10 w-28 rounded-lg" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Personal Details */}
                                <div className="space-y-6">
                                    <div>
                                        <SkeletonLoader className="h-6 w-36 mb-4" />
                                        <div className="space-y-4">
                                            <SkeletonLoader className="h-10 w-full rounded-lg" />
                                            <SkeletonLoader className="h-10 w-full rounded-lg" />
                                            <SkeletonLoader className="h-10 w-full rounded-lg" />
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="space-y-6">
                                    <div>
                                        <SkeletonLoader className="h-6 w-36 mb-4" />
                                        <div className="space-y-4">
                                            <SkeletonLoader className="h-10 w-full rounded-lg" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                                                <SkeletonLoader className="h-10 w-full rounded-lg" />
                                            </div>
                                            <SkeletonLoader className="h-10 w-full rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="mt-12 pt-8 border-t-[3px] border-gray-200">
                                <SkeletonLoader className="h-6 w-36 mb-3" />
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <SkeletonLoader className="h-10 w-10 rounded-lg" />
                                        <div className="space-y-2">
                                            <SkeletonLoader className="h-4 w-16" />
                                            <SkeletonLoader className="h-4 w-32" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <SkeletonLoader className="h-10 w-10 rounded-lg" />
                                        <div className="space-y-2">
                                            <SkeletonLoader className="h-4 w-16" />
                                            <SkeletonLoader className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                        <SkeletonLoader className="h-10 w-10 rounded-lg" />
                                        <div className="space-y-2">
                                            <SkeletonLoader className="h-4 w-16" />
                                            <SkeletonLoader className="h-4 w-36" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div >
    );
};

export default ProfileSkeleton;
