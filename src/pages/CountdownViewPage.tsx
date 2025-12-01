import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Building,
  Moon,
  Trophy,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { AnimatedNumber } from "../components/ui/AnimatedNumber";
import { ProgressCircle } from "../components/ui/ProgressCircle";
import { getCountdownData } from "../services/JsonService";
import { type CountdownData } from "../types/index";

export const CountdownPageViewer: React.FC = () => {
  const [countdownData, setCountdownData] = useState<CountdownData | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCountdownData();
        setCountdownData(data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  if (!countdownData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-gray-400 animate-pulse">
          Loading Tracker...
        </div>
      </div>
    );
  }

  // Statistics Calculations
  const totalNights = countdownData.entries.reduce(
    (sum, entry) => sum + entry.totalNights,
    0
  );
  const targetNights = countdownData.targetNights || 700;
  const remainingTarget = targetNights - totalNights;
  const progressPercentage = (totalNights / targetNights) * 100;
  const totalDeals = countdownData.entries.length;
  const avgNights = totalDeals > 0 ? Math.round(totalNights / totalDeals) : 0;
  const isComplete = totalNights >= targetNights;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Countdown Tracker
        </motion.h1>
        <p className="text-xl text-gray-500 font-medium">
          Live Deal Performance Dashboard
        </p>
      </div>

      {/* Top Summary Cards - Large & Bold */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Target Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-t-8 border-blue-500 shadow-xl p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Moon className="text-blue-600 w-12 h-12" />
              </div>
              <div>
                <p className="text-lg text-gray-500 font-semibold uppercase tracking-wider">
                  Target Goal
                </p>
                <div className="text-5xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={targetNights} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Total Nights Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-t-8 border-green-500 shadow-xl p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Calendar className="text-green-600 w-12 h-12" />
              </div>
              <div>
                <p className="text-lg text-gray-500 font-semibold uppercase tracking-wider">
                  Total Nights Sold
                </p>
                <div className="text-5xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={totalNights} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Remaining Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card
            className={`h-full border-t-8 ${remainingTarget > 0 ? "border-orange-500" : "border-red-500"} shadow-xl p-8`}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div
                className={`p-4 rounded-full ${remainingTarget > 0 ? "bg-orange-100" : "bg-red-100"}`}
              >
                <Building
                  className={`w-12 h-12 ${remainingTarget > 0 ? "text-orange-600" : "text-red-600"}`}
                />
              </div>
              <div>
                <p className="text-lg text-gray-500 font-semibold uppercase tracking-wider">
                  {remainingTarget > 0 ? "Nights Remaining" : "Over Target By"}
                </p>
                <div
                  className={`text-5xl font-bold mt-2 ${remainingTarget > 0 ? "text-gray-900" : "text-green-600"}`}
                >
                  <AnimatedNumber value={Math.abs(remainingTarget)} />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Visualization Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 p-10 flex flex-col xl:flex-row items-center justify-center xl:justify-around gap-12">
            {/* Left Side: Giant Progress Circle */}
            <div className="flex flex-col items-center relative">
              <h2 className="text-2xl font-bold text-gray-700 mb-8">
                Overall Progress
              </h2>
              <div className="relative">
                <ProgressCircle
                  value={totalNights}
                  max={targetNights}
                  size={350} // Much larger size
                  strokeWidth={25} // Thicker stroke
                  label={
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-800">
                        {Math.round(progressPercentage)}%
                      </span>
                      <p className="text-sm text-gray-500 mt-1 uppercase">
                        Completed
                      </p>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Right Side: Detailed Stats Grid */}
            <div className="flex-1 w-full max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Total Deals Box */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 hover:shadow-md transition-shadow">
                  <div className="bg-indigo-100 p-4 rounded-xl">
                    <Trophy className="text-indigo-600 w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Total Deals</p>
                    <p className="text-4xl font-bold text-gray-800">
                      <AnimatedNumber value={totalDeals} />
                    </p>
                  </div>
                </div>

                {/* Avg Nights Box */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 hover:shadow-md transition-shadow">
                  <div className="bg-teal-100 p-4 rounded-xl">
                    <TrendingUp className="text-teal-600 w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">
                      Avg Nights/Deals
                    </p>
                    <p className="text-4xl font-bold text-gray-800">
                      <AnimatedNumber value={avgNights} />
                      <span className="text-lg text-gray-400 font-normal ml-1">
                        nts
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status Box */}
                <div
                  className={`col-span-1 sm:col-span-2 p-8 rounded-2xl shadow-sm border flex items-center justify-between hover:shadow-md transition-shadow ${isComplete ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}
                >
                  <div className="flex items-center space-x-6">
                    <div
                      className={`p-4 rounded-xl ${isComplete ? "bg-green-200" : "bg-orange-100"}`}
                    >
                      {isComplete ? (
                        <CheckCircle className="text-green-700 w-8 h-8" />
                      ) : (
                        <TrendingUp className="text-orange-600 w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">
                        Current Status
                      </p>
                      <p
                        className={`text-3xl font-bold ${isComplete ? "text-green-700" : "text-orange-600"}`}
                      >
                        {isComplete ? "Target Achieved!" : "In Progress..."}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar Visual for Status */}
                  <div className="hidden sm:block w-1/3">
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${isComplete ? "bg-green-500" : "bg-orange-500"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
