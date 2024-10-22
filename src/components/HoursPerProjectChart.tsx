"use client";

import { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartDataItem {
  prosjektNavn: string;
  timer: number;
  prosjektId: string;
  bedriftId: string;
  bedriftNavn: string;
}

export function HoursPerProjectChart() {
  const [data, setData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/time-per-project');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const jsonData: ChartDataItem[] = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error('Feil ved henting av data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer per Prosjekt</CardTitle>
        <CardDescription>Totalt antall loggede timer per prosjekt</CardDescription>
      </CardHeader>
      <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="prosjektNavn" 
            angle={0} 
            textAnchor="end" 
            height={100} 
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}t`}
            tick={{ fontSize: 12 }}
          />
          <Bar dataKey="timer" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Timer per prosjekt <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Viser totale loggede timer for hvert prosjekt
        </div>
      </CardFooter>
    </Card>
  );
}