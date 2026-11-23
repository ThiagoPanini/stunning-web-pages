import { Section } from "./section";

// No portal (3): link cards to Playground, Dados and Integrações, each a media placeholder with an action
// tag that inverts on hover. Filled by the ticket of practice, portal, contact and footer.
export function Portal() {
  return <Section block="portal" id="portal" />;
}
