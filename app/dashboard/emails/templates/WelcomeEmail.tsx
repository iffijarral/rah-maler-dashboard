import * as React from "react";
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
  Button,
  Hr,
} from "@react-email/components";

// Define the interface for the props
interface WelcomeEmailProps {
  message: string;
  recipientName?: string; // This is optional
  ctaLink?: string;       // This is optional
}

// Corrected component definition
export default function WelcomeEmail({ message, recipientName, ctaLink = "http://localhost:3000" }: WelcomeEmailProps) {
  // Define custom colors or use Tailwind's default palette
  const brandBlue = 'bg-[#007bff]';
  const brandTextColor = 'text-[#2c3e50]';
  const lightBgColor = 'bg-[#f8f9fa]';

  return (
    <Html>
      <Head />
      <Preview>Velkommen til RAH Maler!</Preview>
      <Body className={`font-sans ${lightBgColor} p-5 md:p-10`}>
        <Container className="bg-white rounded-lg shadow-md max-w-[600px] mx-auto border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <Section className="bg-white p-6 rounded-t-lg">
            <Row>
              <Column>
                <Img
                  src="https://via.placeholder.com/150x50/007bff/ffffff?text=RAH+Maler+Logo"
                  width="150"
                  height="50"
                  alt="RAH Maler Logo"
                  className="max-w-[150px] h-auto block"
                />
              </Column>
              <Column align="right">
                <Text className={`text-2xl font-bold ${brandBlue.replace('bg-', 'text-')} m-0 leading-tight`}>
                  Velkommen! 🎉
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content Section */}
          <Section className="bg-white p-5">
            <Text className={`text-lg font-bold ${brandTextColor}`}>
              Hej {recipientName || 'der'},
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              {message}
            </Text>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              Vi er glade for at have dig med. Klik nedenfor for at komme i gang med dit malerprojekt!
            </Text>

            {/* CTA Button */}
            <Section className="text-center my-5">
              <Button href={ctaLink} className={`${brandBlue} text-white font-bold py-3 px-6 rounded-md text-lg inline-block text-center`}>
                Kom i gang!
              </Button>
            </Section>

            <Text className={`text-base ${brandTextColor} my-4 leading-relaxed`}>
              Hvis du har spørgsmål, er du altid velkommen til at kontakte os.
            </Text>
          </Section>

          {/* Footer Section */}
          <Section className="p-5 text-center text-gray-600 text-sm">
            <Hr className="border-t border-gray-300 my-6" />
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
                <Link href={ctaLink}>
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