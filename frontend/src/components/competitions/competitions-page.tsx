import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitionCard } from "./competition-card";
import { CompetitionDetails } from "./competition-details";
import { Competition, UserCompetition } from "@/types/competition";
import api from "@/lib/api";
import { toast } from "sonner";

export const CompetitionsPage: React.FC = () => {
  const [ongoingCompetitions, setOngoingCompetitions] = useState<
    UserCompetition[]
  >([]);
  const [availableCompetitions, setAvailableCompetitions] = useState<
    Competition[]
  >([]);
  const [completedCompetitions, setCompletedCompetitions] = useState<
    UserCompetition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<
    Competition | UserCompetition | null
  >(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsType, setDetailsType] = useState<
    "available" | "ongoing" | "completed"
  >("ongoing");

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const now = new Date();

      const availableResponse = await api.get(
        "/competitions/user/discover-subscribed-gym-competitions"
      );
      const availableData = availableResponse.data.data || [];

      const joinedResponse = await api.get(
        "/competitions/user/joined-subscribed-gym-competitions"
      );
      const joinedData = joinedResponse.data.data || [];

      console.log("Available competitions:", availableData);
      console.log("Joined competitions:", joinedData);
      console.log("Current date:", now);

      const available = availableData.filter((comp: Competition) => {
        const endDate = new Date(comp.endDate);
        const isAvailable = Boolean(
          comp.isActive &&
          endDate >= now
        );

        console.log(`Available competition ${comp.id} (${comp.name}):`, {
          endDate,
          isActive: comp.isActive,
          participants: comp._count?.participants,
          maxParticipants: comp.maxParticipants,
          isAvailable,
        });

        return isAvailable;
      });

      const ongoing = joinedData.filter((userComp: UserCompetition) => {
        const endDate = new Date(userComp.competition.endDate);
        const isOngoing = Boolean(endDate >= now && userComp.isActive);

        console.log(
          `Ongoing competition ${userComp.competition.id} (${userComp.competition.name}):`
        , {
          endDate,
          isActive: userComp.isActive,
          isOngoing,
        });

        return isOngoing;
      });

      const completed = joinedData.filter((userComp: UserCompetition) => {
        const endDate = new Date(userComp.competition.endDate);
        const isCompleted = endDate < now;

        console.log(
          `Completed competition ${userComp.competition.id} (${userComp.competition.name}):`
        , {
          endDate,
          now,
          isCompleted,
        });

        return isCompleted;
      });

      console.log("Filtered results:", {
        ongoing: ongoing.length,
        completed: completed.length,
        available: available.length,
      });

      setOngoingCompetitions(ongoing);
      setCompletedCompetitions(completed);
      setAvailableCompetitions(available);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      toast.error("Failed to load competitions");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompetition = async (competitionId: number) => {
    try {
      const competition = availableCompetitions.find(
        (comp) => comp.id === competitionId
      );

      if (!competition) {
        toast.error("Competition not found");
        return;
      }

      const now = new Date();
      const startDate = new Date(competition.startDate);
      const endDate = new Date(competition.endDate);

      if (!competition.isActive) {
        toast.error("This competition is not active");
        return;
      }

      if (startDate > now) {
        toast.error("This competition hasn't started yet");
        return;
      }

      if (endDate < now) {
        toast.error("This competition has already ended");
        return;
      }

      if (
        competition._count &&
        competition._count.participants >= competition.maxParticipants
      ) {
        toast.error("This competition is at maximum capacity");
        return;
      }

      await api.post(`/competitions/${competitionId}/join`);
      toast.success("Successfully joined competition!");
      fetchCompetitions(); 
      setDetailsOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to join competition"
      );
    }
  };

  const handleViewDetails = (
    competition: Competition | UserCompetition,
    type: "available" | "ongoing" | "completed"
  ) => {
    setSelectedCompetition(competition);
    setDetailsType(type);
    setDetailsOpen(true);
  };

  const getCompetitionId = (
    competition: Competition | UserCompetition
  ): number => {
    return "competition" in competition
      ? competition.competition.id
      : competition.id;
  };

  const canJoinCompetition = (competition: Competition): boolean => {
    const now = new Date();
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    return Boolean(
      competition.isActive &&
      startDate <= now &&
      endDate >= now &&
      competition._count &&
      competition._count.participants < competition.maxParticipants
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competitions</h1>
        <p className="text-muted-foreground">
          Join competitions, track your progress, and compete with others!
        </p>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ongoing">
            Ongoing ({ongoingCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableCompetitions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCompetitions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-6">
          {ongoingCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You are not participating in any ongoing competitions.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check the Available tab to join new competitions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="ongoing"
                  onViewDetails={() =>
                    handleViewDetails(competition, "ongoing")
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {availableCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No competitions available from your subscribed gyms.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Subscribe to more gyms or check back later for new competitions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="available"
                  onViewDetails={() =>
                    handleViewDetails(competition, "available")
                  }
                  onJoin={
                    canJoinCompetition(competition)
                      ? () => handleJoinCompetition(competition.id)
                      : undefined
                  }
                  canJoin={canJoinCompetition(competition)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                You have not completed any competitions yet.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Join some competitions to start building your history!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  type="completed"
                  onViewDetails={() =>
                    handleViewDetails(competition, "completed")
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedCompetition && (
        <CompetitionDetails
          competition={selectedCompetition}
          type={detailsType}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onJoin={
            detailsType === "available"
              ? () =>
                  handleJoinCompetition(getCompetitionId(selectedCompetition))
              : undefined
          }
        />
      )}
    </div>
  );
};
