import React from 'react';
import { motion } from "motion/react";

const SkeletonLoader = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const OrdersSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b bg-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-red-900 mb-2">
                        My <span className="text-red-600">Orders</span>
                    </h1>
                    <p className="text-red-700 font-[600]">Track and manage your order history</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <SkeletonLoader className="h-4 w-20" />
                                    <SkeletonLoader className="h-6 w-12" />
                                </div>
                                <SkeletonLoader className="h-10 w-10 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 inline-flex">
                        {[...Array(3)].map((_, index) => (
                            <SkeletonLoader key={index} className="h-8 w-24 mx-2 rounded-lg" />
                        ))}
                    </div>
                </motion.div>

                {/* Orders Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                >
                    {[...Array(4)].map((_, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="bg-white rounded-xl p-6 min-h-[300px] shadow-sm border border-gray-200">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <SkeletonLoader className="h-6 w-32" />
                                        <SkeletonLoader className="h-6 w-20" />
                                    </div>
                                    <div className="flex space-x-2 mb-4">
                                        <SkeletonLoader className="h-18 w-20 rounded-lg" />
                                        <SkeletonLoader className="h-18 w-20 rounded-lg" />
                                        <SkeletonLoader className="h-18 w-20 rounded-lg" />
                                        <SkeletonLoader className="h-18 w-20 rounded-lg" />
                                    </div>

                                    <SkeletonLoader className="h-4 w-48" />
                                    <SkeletonLoader className="h-4 w-36" />
                                    <div className="flex justify-between">
                                        <SkeletonLoader className="h-10 w-24 rounded-lg" />
                                        <SkeletonLoader className="h-10 w-24 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default OrdersSkeleton;
