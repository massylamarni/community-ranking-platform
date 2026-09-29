import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Spinner } from "../ui/spinner";

export default function LoadingGuard() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Traitement de votre demande</EmptyTitle>
        <EmptyDescription>
          Veuillez patienter pendant le traitement de votre demande. Ne
          rechargez pas la page.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
