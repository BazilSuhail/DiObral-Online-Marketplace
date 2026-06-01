import React from 'react';
import { motion } from "motion/react";

const SkeletonLoader = ({ className }) => (
    <div className={`soft-skeleton ${className}`} />
);

const OrdersSkeleton = () => {
    return (
        <div className="soft-page">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <SkeletonLoader className="h-8 w-44" />
                    <SkeletonLoader className="h-4 w-64 mt-2" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="soft-card rounded-3xl p-5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <SkeletonLoader className="h-3 w-20" />
                                    <SkeletonLoader className="h-6 w-16" />
                                </div>
                                <SkeletonLoader className="h-11 w-11 rounded-2xl" />
                            </div>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="soft-card rounded-2xl p-1.5 inline-flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <SkeletonLoader key={i} className="h-8 w-24 rounded-full" />
                        ))}
                    </div>
                </motion.div>

                <div className="grid gap-5 md:grid-cols-2">
                    {[...Array(2)].map((_, g) => (
                        <motion.div
                            key={g}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + g * 0.05 }}
                            className="soft-card rounded-3xl overflow-hidden"
                        >
                            <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-gray-200/60 bg-gray-100">
                                <div className="flex items-center gap-3">
                                    <SkeletonLoader className="w-11 h-11 rounded-2xl" />
                                    <div className="space-y-2">
                                        <SkeletonLoader className="h-4 w-28" />
                                        <SkeletonLoader className="h-3 w-32" />
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <SkeletonLoader className="h-5 w-20 ml-auto" />
                                    <SkeletonLoader className="h-4 w-16 ml-auto rounded-full" />
                                </div>
                            </div>

                            <div className="p-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                {[...Array(2)].map((_, t) => (
                                    <div key={t} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-100 ring-1 ring-gray-200/60">
                                        <div className="flex -space-x-2 flex-shrink-0">
                                            <SkeletonLoader className="w-10 h-10 rounded-xl" />
                                            <SkeletonLoader className="w-10 h-10 rounded-xl" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <SkeletonLoader className="h-4 w-28" />
                                            <SkeletonLoader className="h-3 w-20" />
                                        </div>
                                        <SkeletonLoader className="h-5 w-16 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersSkeleton;
