export enum OppgaveStatus {
    IKKE_STARTET = "IKKE_STARTET",
    I_GANG = "I_GANG",
    FULLFORT = "FULLFORT",
}

export const oppgaveStatusTilTekst: { [key in OppgaveStatus]: string } = {
    [OppgaveStatus.IKKE_STARTET]: "Ikke startet",
    [OppgaveStatus.I_GANG]: "I gang",
    [OppgaveStatus.FULLFORT]: "Fullført",
};
