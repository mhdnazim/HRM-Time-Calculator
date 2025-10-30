'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateBreakTime, formatTime } from '@/lib/time-utils';
import { Clock, Timer, CheckCircle, AlertTriangle, Coffee, User, UserMinus, UserX } from 'lucide-react';

export default function TimeCalculator() {
  const [timeLogs, setTimeLogs] = useState('');
  const [results, setResults] = useState<any>(null);
  const [workType, setWorkType] = useState<'full-day' | 'hlop' | 'qlop'>('full-day');

  const handleCalculate = () => {
    if (!timeLogs.trim()) return;
    
    const calculationResults = calculateBreakTime(timeLogs, workType);
    setResults(calculationResults);
  };

  const placeholderText = `08:40:01 AM	In
10:38:43 AM	Out
10:43:02 AM	In`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 py-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coffee className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Break Time Calculator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Track your work breaks and calculate productive hours
          </p>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Input Card */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Time Logs
                </CardTitle>
                <CardDescription>
                  Enter time logs line by line (HH:MM:SS AM/PM [tab] In/Out)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Work Type Selection */}
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Type:</span>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="workType"
                        value="full-day"
                        checked={workType === 'full-day'}
                        onChange={(e) => setWorkType(e.target.value as 'full-day')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Full Day</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="workType"
                        value="hlop"
                        checked={workType === 'hlop'}
                        onChange={(e) => setWorkType(e.target.value as 'hlop')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">HLOP</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="workType"
                        value="qlop"
                        checked={workType === 'qlop'}
                        onChange={(e) => setWorkType(e.target.value as 'qlop')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">QLOP</span>
                    </label>
                  </div>
                </div>

                <Textarea
                  value={timeLogs}
                  onChange={(e) => setTimeLogs(e.target.value)}
                  placeholder={placeholderText}
                  className="min-h-[200px] font-mono text-sm resize-none"
                />
                <Button 
                  onClick={handleCalculate}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  size="lg"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Calculate Break Time
                </Button>
              </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card className="shadow-lg border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">How to use</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>• Select your work type: Full Day, HLOP, or QLOP</p>
                <p>• Enter each time entry on a new line</p>
                <p>• Format: HH:MM:SS AM/PM [TAB] In/Out</p>
                <p>• Example: 08:40:01 AM	In</p>
                <p>• <strong>Full Day:</strong> 8h productive + 45min minimum break</p>
                <p>• <strong>HLOP:</strong> 4h productive + 15min minimum break</p>
                <p>• <strong>QLOP:</strong> 6h productive + 30min minimum break</p>
                <p>• Break time shows green when minimum is reached</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {results ? (
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Total Break Time */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Total break/out time:
                    </span>
                    <Badge 
                      variant={results.isBreakTimeSufficient ? "default" : "destructive"}
                      className={`text-lg px-3 py-1 ${
                        results.isBreakTimeSufficient
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {formatTime(results.totalBreakTime)}
                    </Badge>
                  </div>

                  {/* Break Time Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {results.isBreakTimeSufficient ? 'Break time status:' : 'Break time needed:'}
                    </span>
                    <Badge 
                      variant={results.isBreakTimeSufficient ? "default" : "secondary"}
                      className={`text-lg px-3 py-1 ${
                        results.isBreakTimeSufficient
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}
                    >
                      {results.isBreakTimeSufficient
                        ? 'Minimum reached'
                        : formatTime(results.remainingBreakTime)
                      }
                    </Badge>
                  </div>

                  {/* Expected Exit Time */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Expected exit time:
                    </span>
                    <Badge variant="outline" className="text-lg px-3 py-1 border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                      {results.expectedExitTime}
                    </Badge>
                  </div>

                  {/* Productive Hours */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Productive hours:
                    </span>
                    <Badge 
                      variant={results.isProductiveComplete ? "default" : "secondary"}
                      className={`text-lg px-3 py-1 ${
                        results.isProductiveComplete 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      }`}
                    >
                      {formatTime(Math.max(0, results.productiveHours))}
                    </Badge>
                  </div>

                  {/* Time Left for Target Hours */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {results.isProductiveComplete ? 'Status:' : `Time left for ${formatTime(results.targetProductiveHours)}:`}
                    </span>
                    {results.isProductiveComplete ? (
                      <Badge className="text-lg px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {formatTime(results.targetProductiveHours)} completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-lg px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {formatTime(results.timeLeftForTargetHours)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <Clock className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No Results Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter your time logs and click "Calculate Break Time" to see your results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
