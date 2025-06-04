// components/competitions/competition-details.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Medal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Crown,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import {
  Competition,
  UserCompetition,
  TaskWithProgress,
  LeaderboardEntry,
} from "@/types/competition";
import { TaskProgressDialog } from "./task-progress-dialog";

interface CompetitionDetailsProps {
  competition: Competition | UserCompetition;
  type: "available" | "ongoing" | "completed";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin?: () => void;
}

export const CompetitionDetails: React.FC<CompetitionDetailsProps> = ({
  competition,
  type,
  open,
  onOpenChange,
  onJoin,
}) => {
  const [allTasks, setAllTasks] = useState<TaskWithProgress[]>([]);
  const [allLeaderboard, setAllLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithProgress | null>(
    null
  );
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [competitionData, setCompetitionData] = useState<Competition | null>(
    null
  );
  const [userProgressData, setUserProgressData] = useState<any>(null);

  const [tasksPage, setTasksPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 5;

  const isUserCompetition = "totalPoints" in competition;
  const comp = isUserCompetition ? competition.competition : competition;
  const userProgress = isUserCompetition ? competition : null;

  const totalTasksPages = Math.ceil(allTasks.length / itemsPerPage);
  const paginatedTasks = allTasks.slice(
    (tasksPage - 1) * itemsPerPage,
    tasksPage * itemsPerPage
  );

  const totalLeaderboardPages = Math.ceil(allLeaderboard.length / itemsPerPage);
  const paginatedLeaderboard = allLeaderboard.slice(
    (leaderboardPage - 1) * itemsPerPage,
    leaderboardPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const canJoinCompetition = (): boolean => {
    const now = new Date();
    const startDate = new Date(comp.startDate);
    const endDate = new Date(comp.endDate);

    return Boolean(
      comp.isActive &&
      startDate <= now &&
      endDate >= now &&
      comp._count &&
      comp._count.participants < comp.maxParticipants
    );
  };

  const canUpdateProgress = (): boolean => {
    if (type !== "ongoing") return false;
    
    const now = new Date();
    const endDate = new Date(comp.endDate);
    
    return Boolean(endDate >= now && comp.isActive);
  };

  const getJoinButtonDisabledReason = (): string | null => {
    if (!comp.isActive) return "This competition is not active";
    
    const now = new Date();
    const startDate = new Date(comp.startDate);
    const endDate = new Date(comp.endDate);
    
    if (startDate > now) return "Competition hasn't started yet";
    if (endDate < now) return "Competition has ended";
    if (comp._count && comp._count.participants >= comp.maxParticipants) {
      return "Competition is at maximum capacity";
    }
    return null;
  };

  useEffect(() => {
    if (open) {
      fetchCompetitionData();
      setTasksPage(1);
      setLeaderboardPage(1);
    }
  }, [open, comp.id]);

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      if (type === "ongoing" || type === "completed") {
        const progressResponse = await api.get(
          `/competitions/user/competitions/${comp.id}/progress`
        );
        const progressData = progressResponse.data.data;
        
        setUserProgressData(progressData.participant);
        setAllTasks(progressData.tasks || []);
        setCompetitionData(progressData.participant.competition);
      } else {
        const competitionResponse = await api.get(`/competitions/${comp.id}`);
        const competitionData = competitionResponse.data.data;
        setCompetitionData(competitionData);
        setAllTasks(competitionData.competitionTasks || []);
      }

      const leaderboardResponse = await api.get(
        `/competitions/${comp.id}/leaderboard`
      );
      setAllLeaderboard(leaderboardResponse.data.data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching competition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = (task: TaskWithProgress) => {
    if (!canUpdateProgress()) {
      return;
    }
    setSelectedTask(task);
    setProgressDialogOpen(true);
  };

  const handleProgressUpdated = () => {
    fetchCompetitionData();
    setProgressDialogOpen(false);
  };

  const getCurrentProgress = (task: TaskWithProgress): number => {
    if (task.progress) {
      return parseFloat(task.progress.currentValue) || 0;
    }
    if (task.userProgress && task.userProgress.length > 0) {
      return parseFloat(task.userProgress[0].currentValue) || 0;
    }
    return 0;
  };

  const getProgressPercentage = (task: TaskWithProgress): number => {
    const current = getCurrentProgress(task);
    const target = parseFloat(task.targetValue);
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  const isTaskCompleted = (task: TaskWithProgress): boolean => {
    if (task.progress) {
      return task.progress.isCompleted;
    }
    if (task.userProgress && task.userProgress.length > 0) {
      return task.userProgress[0].isCompleted;
    }
    return false;
  };

  const getTaskNotes = (task: TaskWithProgress): string | null => {
    if (task.progress) {
      return task.progress.notes;
    }
    if (task.userProgress && task.userProgress.length > 0) {
      return task.userProgress[0].notes;
    }
    return null;
  };

  const handleTasksPageChange = (newPage: number) => {
    setTasksPage(Math.max(1, Math.min(totalTasksPages, newPage)));
  };

  const handleLeaderboardPageChange = (newPage: number) => {
    setLeaderboardPage(Math.max(1, Math.min(totalLeaderboardPages, newPage)));
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-white" />;
      case 2:
        return <Medal className="h-4 w-4 text-white" />;
      case 3:
        return <Medal className="h-4 w-4 text-white" />;
      default:
        return <span className="text-sm font-semibold">#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gold-badge text-white";
      case 2:
        return "bg-silver-badge text-white";
      case 3:
        return "bg-bronze-badge text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const participantCount = competitionData?._count?.participants || 
                          comp._count?.participants || 0;

  const currentUserProgress = userProgressData || userProgress;
  const joinDisabledReason = getJoinButtonDisabledReason();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{comp.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="relative">
              <img
                src={comp.imageUrl || "/api/placeholder/800/300"}
                alt={comp.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4">
                {type === "completed" && (
                  <Badge variant="default" className="bg-completed text-completed-foreground">
                    Completed
                  </Badge>
                )}
                {type === "ongoing" && (
                  <Badge variant="default">Ongoing</Badge>
                )}
                {type === "available" && (
                  <Badge variant="outline">Available</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{comp.gym.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(comp.startDate)} -{" "}
                        {formatDate(comp.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {participantCount}/{comp.maxParticipants}{" "}
                        participants
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {currentUserProgress && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Total Points</span>
                        </div>
                        <span className="font-semibold">
                          {currentUserProgress.totalPoints}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getRankIcon(currentUserProgress.rank)}
                          <span className="text-sm">Current Rank</span>
                        </div>
                        <span className="font-semibold">
                          #{currentUserProgress.rank || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{currentUserProgress.completionPct}%</span>
                        </div>
                        <Progress
                          value={parseFloat(currentUserProgress.completionPct)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{comp.description}</p>
            </div>

            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">
                  Tasks ({allTasks.length})
                </TabsTrigger>
                <TabsTrigger value="leaderboard">
                  Leaderboard ({allLeaderboard.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Competition Tasks</h3>
                  {type === "available" && onJoin && (
                    <div className="flex flex-col items-end gap-2">
                      {joinDisabledReason && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span>{joinDisabledReason}</span>
                        </div>
                      )}
                      <Button 
                        onClick={onJoin} 
                        disabled={!canJoinCompetition()}
                        title={joinDisabledReason || undefined}
                      >
                        Join Competition
                      </Button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading tasks...</div>
                ) : allTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tasks available for this competition.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4">
                      {paginatedTasks.map((task) => {
                        const currentProgress = getCurrentProgress(task);
                        const progressPercentage = getProgressPercentage(task);
                        const target = parseFloat(task.targetValue);
                        const isCompleted = isTaskCompleted(task);
                        const notes = getTaskNotes(task);

                        return (
                          <Card key={task.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {task.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {task.pointsValue} points
                                  </Badge>
                                  {isCompleted && (
                                    <Badge variant="default" className="bg-green-600">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-3">
                                {task.description}
                              </p>
                              
                              {(type === "ongoing" || type === "completed") && (
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>
                                      {currentProgress.toLocaleString()} / {target.toLocaleString()} {task.unit} ({progressPercentage.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <Progress value={progressPercentage} />
                                  {isCompleted && (
                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                      <Trophy className="h-4 w-4" />
                                      <span>Task Completed! 🎉</span>
                                    </div>
                                  )}
                                  {notes && (
                                    <div className="text-sm text-muted-foreground italic">
                                      Note: {notes}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    Target:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {target.toLocaleString()} {task.unit}
                                  </span>
                                </div>
                                {type === "ongoing" && canUpdateProgress() && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateProgress(task)}
                                  >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Update Progress
                                  </Button>
                                )}
                                {type === "ongoing" && !canUpdateProgress() && (
                                  <Button
                                    size="sm"
                                    disabled
                                    title="Competition has ended or is inactive"
                                  >
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Update Progress
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {totalTasksPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTasksPageChange(tasksPage - 1)}
                          disabled={tasksPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalTasksPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={page === tasksPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleTasksPageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTasksPageChange(tasksPage + 1)}
                          disabled={tasksPage === totalTasksPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4">
                <h3 className="text-lg font-semibold">Leaderboard</h3>
                {loading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : allLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No participants yet.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {paginatedLeaderboard.map((entry, index) => {
                        const globalIndex = (leaderboardPage - 1) * itemsPerPage + index;
                        const isCurrentUser = currentUserProgress && entry.userId === currentUserProgress.userId;
                        
                        return (
                          <Card key={entry.id} className={isCurrentUser ? "ring-2 ring-primary" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getRankBadgeClass(entry.rank)}`}>
                                    {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                                  </div>
                                  <div>
                                    <p className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                                      {entry.user.displayName}
                                      {isCurrentUser && " (You)"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {entry.completionPct}% complete
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {entry.totalPoints} pts
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {entry._count.taskProgress} tasks
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {totalLeaderboardPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaderboardPageChange(leaderboardPage - 1)}
                          disabled={leaderboardPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalLeaderboardPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={page === leaderboardPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleLeaderboardPageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaderboardPageChange(leaderboardPage + 1)}
                          disabled={leaderboardPage === totalLeaderboardPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTask && canUpdateProgress() && (
        <TaskProgressDialog
          task={selectedTask}
          open={progressDialogOpen}
          onOpenChange={setProgressDialogOpen}
          onProgressUpdated={handleProgressUpdated}
        />
      )}
    </>
  );
};
