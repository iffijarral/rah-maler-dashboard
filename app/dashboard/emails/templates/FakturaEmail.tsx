import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Row,
  Column,
  Img,
  Link,
  Hr, // Make sure Hr is imported for the divider
} from "@react-email/components";
import React from "react"; // Keep React imported

// This component is a named export, so you'd import it like:
// import { FakturaEmail } from '@/app/dashboard/emails/templates/FakturaEmail';
export function FakturaEmail({ name }: { name: string }) {
  // Define custom colors or use Tailwind's default palette
  // For custom colors, ensure they are defined in your tailwind.config.js
  const brandBlue = 'bg-[#007bff]'; // Example: your brand blue
  const brandTextColor = 'text-[#2c3e50]'; // Example: a dark text color
  const lightBgColor = 'bg-[#f8f9fa]'; // Example: a light background color

  return (
    <Html>
      <Head />
      <Preview>Faktura fra RAH Maler!</Preview>
      <Body className={`font-sans ${lightBgColor} p-5 md:p-10`}>
        <Container className="bg-white rounded-lg shadow-md max-w-[600px] mx-auto border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <Section className="bg-white p-6 rounded-t-lg">
            <Row>
              <Column>
                {/* Replace with your actual logo */}
                <Img
                  src="https://via.placeholder.com/150x50/007bff/ffffff?text=RAH+Maler+Logo" // Placeholder logo
                  width="150"
                  height="50"
                  alt="RAH Maler Logo"
                  className="max-w-[150px] h-auto block"
                />
              </Column>
              <Column align="right">
                <Text className={`text-2xl font-bold ${brandBlue.replace('bg-', 'text-')} m-0 leading-tight`}>
                  RAH Maler 🎉
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content Section */}
          <Section className="bg-white p-5">
            <Text className={`text-lg font-bold ${brandTextColor}`}>
              Hej {name},
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              Tak for din tillid til RAH Maler.
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              Vedhæftet finder du fakturaen for det udførte arbejde. Du er velkommen til at vende tilbage, hvis du har spørgsmål til indholdet.
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              Betalingsoplysninger og beløb fremgår af fakturaen. Vi sætter stor pris på din betaling inden for den angivne frist.
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              På forhånd tak – og tak for samarbejdet!
            </Text>
          </Section>

          {/* Footer Section */}
          <Section className="p-5 text-center text-gray-600 text-sm">
            <Hr className="border-t border-gray-300 my-6" /> {/* Tailwind for Hr */}
            <Text className={`m-0 text-base ${brandTextColor}`}>
              Med venlig hilsen,
              <br />
              <strong className={brandBlue.replace('bg-', 'text-')}>Khadim Hussain</strong>
              <br />
              RAH Maler
            </Text>

            <Text className="m-0 mt-2">
              <Link href={`mailto:info@rahmaler.dk`} className={`${brandBlue.replace('bg-', 'text-')} underline`}>
                info@rahmaler.dk
              </Link>
            </Text>

            {/* Your Image Column */}
            <Row className="mt-5">
              <Column>
                <Link href="#"> {/* Consider replacing '#' with your website link */}
                  <Img
                    alt="RAH Maler Project Showcase"
                    src="https://images.unsplash.com/photo-1582234057997-6a5b6f3c1b6a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width="600"
                    height="300"
                    className="max-w-full h-auto block rounded-lg object-cover mx-auto"
                  />
                </Link>
              </Column>
            </Row>

            <Text className="mt-5 text-xs text-gray-500">
              &copy; {new Date().getFullYear()} RAH Maler. Alle rettigheder forbeholdt.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// When using Tailwind with react-email, you typically don't need these inline styles.
// They are commented out as a reference.
/*
const styles = {
  body: { backgroundColor: "#f4f4f4", padding: "20px", fontFamily: "Arial, sans-serif" },
  container: { backgroundColor: "#ffffff", padding: "20px", borderRadius: "8px", maxWidth: "600px", margin: "0 auto" },
  header: { textAlign: "left" as const },
  title: { fontSize: "24px", fontWeight: "bold", marginBottom: "10px" },
  content: { textAlign: "left" as const, padding: "10px 0" },
  text: { fontSize: "16px", margin: "10px 0", color: "#333" },
  button: { backgroundColor: "#007bff", color: "#ffffff", padding: "12px 24px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold", display: "inline-block", marginTop: "15px" },
  divider: { border: "none", borderTop: "1px solid #ddd", margin: "20px 0" },
  footer: { textAlign: "left" as const, fontSize: "12px", color: "#666" },
  footerText: { margin: "5px 0" },
  link: { color: "#007bff", textDecoration: "none" },
};
*/