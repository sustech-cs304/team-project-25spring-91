import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Trophy, Target, AlertCircle } from "lucide-react";
import { Competition, UserCompetition } from "@/types/competition";

interface CompetitionCardProps {
  competition: Competition | UserCompetition;
  type: "available" | "ongoing" | "completed";
  onViewDetails: () => void;
  onJoin?: () => void;
  canJoin?: boolean;
}

export const CompetitionCard: React.FC<CompetitionCardProps> = ({
  competition,
  type,
  onViewDetails,
  onJoin,
  canJoin = true,
}) => {
  const isUserCompetition = "totalPoints" in competition;
  const comp = isUserCompetition ? competition.competition : competition;
  const userProgress = isUserCompetition ? competition : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const now = new Date();
  const startDate = new Date(comp.startDate);
  const endDate = new Date(comp.endDate);
  const isExpired = endDate < now;
  const isStarted = startDate <= now;
  const isAtCapacity =
    comp._count && comp._count.participants >= comp.maxParticipants;

  const getJoinButtonText = () => {
    if (!comp.isActive) return "Inactive";
    if (!isStarted) return "Not Started";
    if (isExpired) return "Ended";
    if (isAtCapacity) return "Full";
    return "Join Competition";
  };

  const getJoinButtonDisabledReason = () => {
    if (!comp.isActive) return "This competition is not active";
    if (!isStarted) return "Competition hasn't started yet";
    if (isExpired) return "Competition has ended";
    if (isAtCapacity) return "Competition is at maximum capacity";
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={`http://localhost:5000${comp.imageUrl}`|| "/api/placeholder/400/200"}
          alt={comp.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          {type === "completed" && (
            <Badge variant="default" className="bg-completed text-completed-foreground">
              Completed
            </Badge>
          )}
          {type === "ongoing" && (
            <Badge variant="default">
              {isExpired ? "Ended" : "Ongoing"}
            </Badge>
          )}
          {type === "available" && (
            <Badge variant="default">
              {!isStarted ? "Upcoming" : isExpired ? "Ended" : "Available"}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg">{comp.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {comp.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{comp.gym.name}</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(comp.startDate)} - {formatDate(comp.endDate)}
          </span>
        </div>

        {type === "available" && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>
              {comp._count?.participants || 0}/{comp.maxParticipants}{" "}
              participants
            </span>
            {isAtCapacity && (
              <Badge variant="destructive" className="ml-2">
                Full
              </Badge>
            )}
          </div>
        )}

        {userProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>Points: {userProgress.totalPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Rank: #{userProgress.rank || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{userProgress.completionPct}%</span>
              </div>
              <Progress value={parseFloat(userProgress.completionPct)} />
            </div>
          </div>
        )}

        {type === "available" && !canJoin && (
          <div className="flex items-start gap-2 p-2 bg-muted rounded-md">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              {getJoinButtonDisabledReason()}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onViewDetails} variant="outline" className="flex-1">
            View Details
          </Button>
          {type === "available" && onJoin && (
            <Button
              onClick={onJoin}
              className="flex-1"
              disabled={!canJoin}
              title={!canJoin ? getJoinButtonDisabledReason() || undefined : undefined}
            >
              {getJoinButtonText()}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
