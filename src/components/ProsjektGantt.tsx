import React from 'react';
import { Chart } from "react-google-charts";

interface ProsjektGanttProps {
  prosjekt: any;
}

const ProsjektGantt: React.FC<ProsjektGanttProps> = ({ prosjekt }) => {
  const prosjektStartDato = new Date(prosjekt.startDato);
  const prosjektSluttDato = new Date(prosjekt.sluttDato);

  const data = [
    [
      { type: 'string', label: 'Oppgave ID' },
      { type: 'string', label: 'Oppgave Navn' },
      { type: 'date', label: 'Start Dato' },
      { type: 'date', label: 'Slutt Dato' },
      { type: 'number', label: 'Varighet' },
      { type: 'number', label: 'Prosent Fullført' },
      { type: 'string', label: 'Avhengigheter' },
    ],
    [
      'ProsjektVarighet',
      'Prosjekt Varighet',
      prosjektStartDato,
      prosjektSluttDato,
      null,
      0,
      null,
    ],
    ...prosjekt.oppgaver.map((oppgave: any) => {
      let prosentFullfort = 0;
      if (oppgave.status === 'Fullført') {
        prosentFullfort = 100;
      } else if (oppgave.status === 'I gang') {
        if (oppgave.estimertTid && oppgave.faktiskTid) {
          prosentFullfort = Math.min(100, (oppgave.faktiskTid / oppgave.estimertTid) * 100);
        } else {
          prosentFullfort = 50;
        }
      }

      return [
        oppgave.id,
        oppgave.tittel,
        new Date(oppgave.startDato),
        new Date(oppgave.sluttDato),
        null,
        prosentFullfort,
        null,
      ];
    }),
  ];

  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
    },
    timeline: {
      start: prosjektStartDato,
      end: prosjektSluttDato,
    },
  };

  return (
    <Chart
      chartType="Gantt"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />
  );
};

export default ProsjektGantt;
