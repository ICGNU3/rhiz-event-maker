import { notFound } from "next/navigation";
import { getEvent } from "../../actions/events";
import { EventLandingPage } from "../../components/EventLandingPage";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event || !event.config?.content) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.config.content.eventName} | EventManage.ai`,
    description: event.config.content.tagline,
    openGraph: {
      images: event.config.backgroundImage ? [event.config.backgroundImage] : [],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  // Pass the full config, ensuring eventId matches the slug/id we used
  const configWithId = {
      ...event.config,
      eventId: event.slug
  };

  return <EventLandingPage config={configWithId} />;
}
