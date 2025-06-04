"use client";

const data: Stats[] = [
  {
    volumeRank: 1,
    streakRank: 25,
    username: "trader_supreme",
    volume: 985240,
    streak: 11
  },
  {
    volumeRank: 2,
    streakRank: 18,
    username: "cryptoKing42",
    volume: 872150,
    streak: 14
  },
  {
    volumeRank: 3,
    streakRank: 4,
    username: "hodl_master",
    volume: 756320,
    streak: 27
  },
  {
    volumeRank: 4,
    streakRank: 55,
    username: "satoshi_fan",
    volume: 681940,
    streak: 7
  },
  {
    volumeRank: 5,
    streakRank: 1,
    username: "diamond_hands",
    volume: 645280,
    streak: 32
  },
  {
    volumeRank: 6,
    streakRank: 15,
    username: "whale_watcher",
    volume: 612370,
    streak: 15
  },
  {
    volumeRank: 7,
    streakRank: 33,
    username: "crypto_wizard",
    volume: 589430,
    streak: 10
  },
  {
    volumeRank: 8,
    streakRank: 3,
    username: "block_explorer",
    volume: 542760,
    streak: 28
  },
  {
    volumeRank: 9,
    streakRank: 12,
    username: "defi_guru",
    volume: 515830,
    streak: 16
  },
  {
    volumeRank: 10,
    streakRank: 8,
    username: "altcoin_addict",
    volume: 492610,
    streak: 20
  },
  {
    volumeRank: 11,
    streakRank: 35,
    username: "trade_ninja",
    volume: 468750,
    streak: 9
  },
  {
    volumeRank: 12,
    streakRank: 22,
    username: "bullish_trader",
    volume: 456290,
    streak: 12
  },
  {
    volumeRank: 13,
    streakRank: 2,
    username: "crypto_oracle",
    volume: 438710,
    streak: 30
  },
  {
    volumeRank: 14,
    streakRank: 41,
    username: "nft_collector",
    volume: 417250,
    streak: 8
  },
  {
    volumeRank: 15,
    streakRank: 11,
    username: "leverage_lord",
    volume: 396840,
    streak: 17
  },
  {
    volumeRank: 16,
    streakRank: 56,
    username: "moon_chaser",
    volume: 372460,
    streak: 6
  },
  {
    volumeRank: 17,
    streakRank: 38,
    username: "staking_pro",
    volume: 358920,
    streak: 9
  },
  {
    volumeRank: 18,
    streakRank: 5,
    username: "chart_master",
    volume: 336540,
    streak: 25
  },
  {
    volumeRank: 19,
    streakRank: 36,
    username: "wallet_warrior",
    volume: 321780,
    streak: 9
  },
  {
    volumeRank: 20,
    streakRank: 17,
    username: "bear_hunter",
    volume: 308450,
    streak: 14
  },
  {
    volumeRank: 21,
    streakRank: 47,
    username: "tokenomics_expert",
    volume: 293760,
    streak: 8
  },
  {
    volumeRank: 22,
    streakRank: 28,
    username: "degenerate_trader",
    volume: 281450,
    streak: 11
  },
  {
    volumeRank: 23,
    streakRank: 6,
    username: "crypto_voyager",
    volume: 268920,
    streak: 24
  },
  {
    volumeRank: 24,
    streakRank: 39,
    username: "exchange_hopper",
    volume: 257410,
    streak: 9
  },
  {
    volumeRank: 25,
    streakRank: 42,
    username: "dip_buyer",
    volume: 246830,
    streak: 8
  },
  {
    volumeRank: 26,
    streakRank: 19,
    username: "trend_surfer",
    volume: 235270,
    streak: 13
  },
  {
    volumeRank: 27,
    streakRank: 62,
    username: "fomo_fighter",
    volume: 224680,
    streak: 5
  },
  {
    volumeRank: 28,
    streakRank: 7,
    username: "hash_rate",
    volume: 216540,
    streak: 21
  },
  {
    volumeRank: 29,
    streakRank: 37,
    username: "block_hunter",
    volume: 207390,
    streak: 9
  },
  {
    volumeRank: 30,
    streakRank: 52,
    username: "satoshi_descendant",
    volume: 198240,
    streak: 7
  },
  {
    volumeRank: 31,
    streakRank: 21,
    username: "yield_farmer",
    volume: 190380,
    streak: 12
  },
  {
    volumeRank: 32,
    streakRank: 14,
    username: "metaverse_pioneer",
    volume: 182460,
    streak: 15
  },
  {
    volumeRank: 33,
    streakRank: 48,
    username: "gas_optimizer",
    volume: 174580,
    streak: 8
  },
  {
    volumeRank: 34,
    streakRank: 23,
    username: "smart_contract",
    volume: 167420,
    streak: 12
  },
  {
    volumeRank: 35,
    streakRank: 9,
    username: "validator_node",
    volume: 159840,
    streak: 19
  },
  {
    volumeRank: 36,
    streakRank: 24,
    username: "crypto_samurai",
    volume: 152730,
    streak: 12
  },
  {
    volumeRank: 37,
    streakRank: 61,
    username: "chain_linker",
    volume: 146290,
    streak: 6
  },
  {
    volumeRank: 38,
    streakRank: 16,
    username: "defi_degen",
    volume: 140150,
    streak: 14
  },
  {
    volumeRank: 39,
    streakRank: 50,
    username: "proof_of_work",
    volume: 134670,
    streak: 7
  },
  {
    volumeRank: 40,
    streakRank: 40,
    username: "token_stacker",
    volume: 128920,
    streak: 9
  },
  {
    volumeRank: 41,
    streakRank: 29,
    username: "miner_extraordinaire",
    volume: 123460,
    streak: 10
  },
  {
    volumeRank: 42,
    streakRank: 10,
    username: "blockchain_believer",
    volume: 118750,
    streak: 18
  },
  {
    volumeRank: 43,
    streakRank: 49,
    username: "private_key",
    volume: 113840,
    streak: 8
  },
  {
    volumeRank: 44,
    streakRank: 43,
    username: "coin_collector",
    volume: 109270,
    streak: 8
  },
  {
    volumeRank: 45,
    streakRank: 26,
    username: "digital_goldminer",
    volume: 104590,
    streak: 11
  },
  {
    volumeRank: 46,
    streakRank: 13,
    username: "trading_titan",
    volume: 100320,
    streak: 16
  },
  {
    volumeRank: 47,
    streakRank: 45,
    username: "crypto_connoisseur",
    volume: 96480,
    streak: 8
  },
  {
    volumeRank: 48,
    streakRank: 34,
    username: "airdrop_hunter",
    volume: 92750,
    streak: 10
  },
  {
    volumeRank: 49,
    streakRank: 20,
    username: "peak_performer",
    volume: 88930,
    streak: 13
  },
  {
    volumeRank: 50,
    streakRank: 58,
    username: "whale_alert",
    volume: 85410,
    streak: 6
  },
  {
    volumeRank: 51,
    streakRank: 27,
    username: "ledger_lord",
    volume: 81940,
    streak: 11
  },
  {
    volumeRank: 52,
    streakRank: 32,
    username: "chart_analyst",
    volume: 78530,
    streak: 10
  },
  {
    volumeRank: 53,
    streakRank: 53,
    username: "crypto_crusader",
    volume: 75240,
    streak: 7
  },
  {
    volumeRank: 54,
    streakRank: 31,
    username: "block_builder",
    volume: 72150,
    streak: 10
  },
  {
    volumeRank: 55,
    streakRank: 30,
    username: "tokenizer",
    volume: 69380,
    streak: 10
  },
  {
    volumeRank: 56,
    streakRank: 57,
    username: "hash_hasher",
    volume: 66540,
    streak: 6
  },
  {
    volumeRank: 57,
    streakRank: 59,
    username: "gain_chaser",
    volume: 63720,
    streak: 6
  },
  {
    volumeRank: 58,
    streakRank: 44,
    username: "market_maker",
    volume: 61080,
    streak: 8
  },
  {
    volumeRank: 59,
    streakRank: 46,
    username: "peer_to_peer",
    volume: 58460,
    streak: 8
  },
  {
    volumeRank: 60,
    streakRank: 54,
    username: "wallet_warrior2",
    volume: 55970,
    streak: 7
  },
  {
    volumeRank: 61,
    streakRank: 64,
    username: "crypto_chief",
    volume: 53620,
    streak: 5
  },
  {
    volumeRank: 62,
    streakRank: 51,
    username: "nonce_finder",
    volume: 51340,
    streak: 7
  },
  {
    volumeRank: 63,
    streakRank: 60,
    username: "blockchain_bro",
    volume: 49170,
    streak: 6
  },
  {
    volumeRank: 64,
    streakRank: 63,
    username: "crypto_captain",
    volume: 47080,
    streak: 5
  },
  {
    volumeRank: 65,
    streakRank: 65,
    username: "hash_master",
    volume: 45140,
    streak: 5
  },
  {
    volumeRank: 66,
    streakRank: 69,
    username: "market_mover",
    volume: 43280,
    streak: 4
  },
  {
    volumeRank: 67,
    streakRank: 68,
    username: "defi_dreamer",
    volume: 41450,
    streak: 4
  },
  {
    volumeRank: 68,
    streakRank: 76,
    username: "trading_trooper",
    volume: 39720,
    streak: 3
  },
  {
    volumeRank: 69,
    streakRank: 75,
    username: "portfolio_prince",
    volume: 38150,
    streak: 3
  },
  {
    volumeRank: 70,
    streakRank: 72,
    username: "ledger_leader",
    volume: 36580,
    streak: 3
  },
  {
    volumeRank: 71,
    streakRank: 70,
    username: "key_keeper",
    volume: 35140,
    streak: 4
  },
  {
    volumeRank: 72,
    streakRank: 66,
    username: "chain_champion",
    volume: 33780,
    streak: 5
  },
  {
    volumeRank: 73,
    streakRank: 74,
    username: "defi_dealer",
    volume: 32450,
    streak: 3
  },
  {
    volumeRank: 74,
    streakRank: 71,
    username: "mining_mogul",
    volume: 31210,
    streak: 4
  },
  {
    volumeRank: 75,
    streakRank: 67,
    username: "token_tycoon",
    volume: 30020,
    streak: 4
  },
  {
    volumeRank: 76,
    streakRank: 78,
    username: "hash_hero",
    volume: 28890,
    streak: 2
  },
  {
    volumeRank: 77,
    streakRank: 73,
    username: "crypto_commander",
    volume: 27810,
    streak: 3
  },
  {
    volumeRank: 78,
    streakRank: 77,
    username: "node_navigator",
    volume: 26750,
    streak: 3
  },
  {
    volumeRank: 79,
    streakRank: 80,
    username: "bull_runner",
    volume: 25750,
    streak: 2
  },
  {
    volumeRank: 80,
    streakRank: 81,
    username: "crypto_custodian",
    volume: 24770,
    streak: 2
  },
  {
    volumeRank: 81,
    streakRank: 79,
    username: "altcoin_ace",
    volume: 23810,
    streak: 2
  },
  {
    volumeRank: 82,
    streakRank: 82,
    username: "moonshot_hunter",
    volume: 22880,
    streak: 2
  },
  {
    volumeRank: 83,
    streakRank: 84,
    username: "crypto_curator",
    volume: 21990,
    streak: 1
  },
  {
    volumeRank: 84,
    streakRank: 87,
    username: "gain_getter",
    volume: 21140,
    streak: 1
  },
  {
    volumeRank: 85,
    streakRank: 92,
    username: "fud_fighter",
    volume: 20300,
    streak: 1
  },
  {
    volumeRank: 86,
    streakRank: 85,
    username: "crypto_caesar",
    volume: 19500,
    streak: 1
  },
  {
    volumeRank: 87,
    streakRank: 83,
    username: "block_baron",
    volume: 18710,
    streak: 1
  },
  {
    volumeRank: 88,
    streakRank: 90,
    username: "digital_duke",
    volume: 17940,
    streak: 1
  },
  {
    volumeRank: 89,
    streakRank: 89,
    username: "wallet_wizard",
    volume: 17210,
    streak: 1
  },
  {
    volumeRank: 90,
    streakRank: 93,
    username: "crypto_cavalier",
    volume: 16510,
    streak: 1
  },
  {
    volumeRank: 91,
    streakRank: 86,
    username: "token_trader",
    volume: 15830,
    streak: 1
  },
  {
    volumeRank: 92,
    streakRank: 95,
    username: "crypto_crusader2",
    volume: 15180,
    streak: 1
  },
  {
    volumeRank: 93,
    streakRank: 88,
    username: "btc_baron",
    volume: 14550,
    streak: 1
  },
  {
    volumeRank: 94,
    streakRank: 91,
    username: "chain_chief",
    volume: 13940,
    streak: 1
  },
  {
    volumeRank: 95,
    streakRank: 94,
    username: "crypto_commander2",
    volume: 13360,
    streak: 1
  },
  {
    volumeRank: 96,
    streakRank: 99,
    username: "degen_trader",
    volume: 12800,
    streak: 1
  },
  {
    volumeRank: 97,
    streakRank: 96,
    username: "bullmarket_baron",
    volume: 12250,
    streak: 1
  },
  {
    volumeRank: 98,
    streakRank: 97,
    username: "crypto_captain2",
    volume: 11730,
    streak: 1
  },
  {
    volumeRank: 99,
    streakRank: 98,
    username: "whale_watcher2",
    volume: 11230,
    streak: 1
  },
  {
    volumeRank: 100,
    streakRank: 100,
    username: "new_trader",
    volume: 10750,
    streak: 1
  }
]


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { columns, Stats } from "@/components/leaderboard-columns";
import { DataTable } from "@/components/leaderboard-data-table";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { UserRole } from "@/components/auth/sign-up-form";
import ButterflyLoader from "@/components/butterfly-loader";



const yourRank = 1;

const CompetitionPage = () => {
  const [, setActiveTab] = useState<"volume" | "streak">("volume");
  const { isAuthorized, isLoading } = useRoleProtection({
    allowedRoles: [UserRole.REGULAR_USER]
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs
        defaultValue="volume"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as "volume" | "streak")}
      >
        <div>
          <TabsList>
            <TabsTrigger value="volume">Volume-based</TabsTrigger>
            <TabsTrigger value="streak">Streak-based</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="volume">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Leaderboards</CardTitle>
              <CardDescription>Your rank: {yourRank}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={data}
                tabType="volume"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="streak">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">Leaderboards</CardTitle>
              <CardDescription>Your rank: {yourRank}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={data}
                tabType="streak"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompetitionPage;