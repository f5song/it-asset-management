import React from "react";
import { FaAngleRight } from "react-icons/fa";

type CardProps = {
  title: string;
  count: number;
};

export const Card: React.FC<CardProps> = ({ title, count }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-73">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
            {count.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-row">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            View All
          </div>
          <FaAngleRight className="text-gray-500"/>
        </div>
      </div>
    </div>
  );
};