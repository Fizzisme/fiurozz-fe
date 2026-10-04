'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Separator } from '@/components/ui/global/separator';
import { cn } from '@/lib/utils';
import type { Project } from '@/mock-data/projects';

export default function ProjectTabs({
    project,
    showComments = true,
}: {
    project: Project;
    /** The author's draft preview has nothing to comment on yet. */
    showComments?: boolean;
}) {
    const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info');

    return (
        <div className="w-full flex flex-col">
            {/* --- PHẦN NAVIGATION --- */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto max-w-5xl px-4 lg:px-0">
                    <div className="flex gap-8">
                        {(showComments ? ['Info', 'Comments'] : ['Info']).map((item) => {
                            const value = item.toLowerCase() as 'info' | 'comments';
                            const isActive = activeTab === value;

                            return (
                                <button
                                    key={value}
                                    onClick={() => setActiveTab(value)}
                                    className={cn(
                                        'relative px-0 py-3 text-base font-medium outline-none transition-colors duration-200',
                                        isActive
                                            ? 'text-black dark:text-white'
                                            : 'text-gray-400 hover:text-black dark:hover:text-gray-200',
                                    )}
                                >
                                    {item}

                                    {isActive && (
                                        <motion.div
                                            layoutId="active-tab-underline"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- PHẦN NỘI DUNG --- */}
            <div className="container mx-auto max-w-5xl px-4 lg:px-0 min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="mt-6"
                    >
                        {activeTab === 'info' && (
                            <article className="space-y-8">
                                <section>
                                    <h2 className="text-lg md:text-xl font-semibold mb-3">Description</h2>
                                    <div className="leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-gray-700 dark:text-gray-300">
                                        {project.description}
                                    </div>
                                </section>

                                <Separator className="my-8" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {project.techStack?.length > 0 && (
                                        <section>
                                            <h2 className="text-lg md:text-xl font-semibold mb-3">Tech Stack</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {project.techStack.map((tech) => (
                                                    <span
                                                        key={tech}
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-300"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {project.tags?.length > 0 && (
                                        <section>
                                            <h2 className="text-lg md:text-xl font-semibold mb-3">Tags</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {/* {project.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-full text-xs md:text-sm font-medium"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))} */}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </article>
                        )}

                        {showComments && activeTab === 'comments' && (
                            <div className="py-10 text-center text-gray-500">
                                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                                <p>Be the first to comment on this project.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}