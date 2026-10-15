import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetCompleteStep() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Réinitialisation du mot de passe</CardTitle>
      </CardHeader>
      <CardContent>
        <p role="status">Votre mot de passe a été mis à jour.</p>
      </CardContent>
      <CardFooter>
        <Button nativeButton={false} render={<Link href="/auth/login" />}>
          Retour à la connexion
        </Button>
      </CardFooter>
    </Card>
  );
}
