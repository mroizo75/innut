"use client";

import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AnsatteListeProps {
  ansatte: any[];
}

const AnsatteListe: React.FC<AnsatteListeProps> = ({ ansatte }) => {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Liste over ansatte</CardTitle>
        <Button onClick={() => window.print()}>Skriv ut</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>E-post</TableHead>
              <TableHead>Stilling</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ansatte.map((ansatt) => (
              <TableRow key={ansatt.id}>
                <TableCell>{`${ansatt.navn} ${ansatt.etternavn}`}</TableCell>
                <TableCell>{ansatt.email}</TableCell>
                <TableCell>{ansatt.position || 'Ikke satt'}</TableCell>
                <TableCell>{ansatt.role}</TableCell>
                <TableCell>
                  <Link href={`/ansatte/${ansatt.id}`}>
                    <Button variant="outline" size="sm">
                      Se detaljer
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AnsatteListe;

