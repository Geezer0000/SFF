import React from 'react';
import { ArrowRight, ShieldCheck, Scale, Database, Vote } from 'lucide-react';

interface AboutViewProps {
  onGoToScorecard: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onGoToScorecard }) => {
  return (
    <div className="about-fullscreen-page">
      {/* Hero Section matching America First Hero (Screenshot style) */}
      <section className="about-hero-section">
        <div className="about-hero-bg">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Bern_Federal_Palace_Central_Dome_2019-10-16_18-43.jpg"
            alt="Bundeshaus Bern Kuppel Schwarz-Weiss"
            className="about-hero-bg-img"
          />
          <div className="about-hero-gradient-overlay"></div>
        </div>

        <div className="about-hero-content-wrapper">
          <div className="about-hero-text-block">
            <h1 className="about-main-headline">
              INTRODUCING THE<br />
              PROSCHWEIZ<br />
              SCORECARD
            </h1>
            <p className="about-main-lead">
              Die offizielle und faktenbasierte Auswertungsplattform für alle 246 Mitglieder der Schweizerischen Bundesversammlung und des Schweizerischen Bundesrates über alle Parteigrenzen hinweg.
            </p>
            <div className="about-hero-cta-row">
              <button onClick={onGoToScorecard} className="about-primary-btn">
                <span>SCORECARD ÖFFNEN</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Information Section (Scrolled Content) */}
      <section className="about-details-section">
        <div className="about-content-inner">
          <div className="about-section-header">
            <span className="about-section-tag">TRANSPARENZ & SOUVERÄNITÄT</span>
            <h2 className="about-section-title">Fakten, Abstimmungen und Mandate auf einen Blick</h2>
            <p className="about-section-desc">
              Die ProSchweiz Scorecard liefert Bürgerinnen und Bürgern einen ungefilterten, neutralen Einblick in das tatsächliche Stimmverhalten der gewählten Volks- und Standesvertreter in Bern.
            </p>
          </div>

          <div className="about-grid-cards">
            <div className="about-card">
              <div className="about-card-icon-wrapper">
                <Database size={24} className="about-card-icon" />
              </div>
              <h3 className="about-card-title">100% Offizielle Schweizer Bundesdaten</h3>
              <p className="about-card-text">
                Alle Personendaten, Räte, Kommissionen und Geschäfte stammen direkt aus den amtlichen OData-Schnittstellen der Parlamentsdienste der Schweizerischen Eidgenossenschaft (admin.ch / ws.parlament.ch).
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon-wrapper">
                <Vote size={24} className="about-card-icon" />
              </div>
              <h3 className="about-card-title">Aktuelle Sessionen 2026</h3>
              <p className="about-card-text">
                Auswertung der real behandelten Geschäfte und Gesetze aus den aktuellen Sessionen 2026 (bis Mitte 2026), inklusive Verknüpfung zu den Original-Geschäftsdossiers auf Curia Vista.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon-wrapper">
                <Scale size={24} className="about-card-icon" />
              </div>
              <h3 className="about-card-title">Schweizer Notensystem (1 bis 6)</h3>
              <p className="about-card-text">
                Vorbereitet für das transparente Schweizer Benotungsraster: Von Note 6 (beste Übereinstimmung) bis Note 1 (keine Übereinstimmung). Vor Festlegung von ProSchweiz-Positionen bleibt die Bewertung strikt neutral als <em>Ungraded</em> hinterlegt.
              </p>
            </div>

            <div className="about-card">
              <div className="about-card-icon-wrapper">
                <ShieldCheck size={24} className="about-card-icon" />
              </div>
              <h3 className="about-card-title">Vollständige Biografien & Transparenz</h3>
              <p className="about-card-text">
                Erfassung aller Heimatorte (Bürgerorte), Geburtsorte, Staatsangehörigkeiten (inklusive Doppelbürgerschaften) und Konfessionen auf Basis öffentlicher Register und Smartvote-Selbstdeklarationen.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="about-bottom-banner">
            <div className="bottom-banner-text">
              <h3>Erkunden Sie jetzt die Bundesversammlung</h3>
              <p>Wählen Sie Ihren Kanton oder suchen Sie nach Parlamentariern aus Ihrer Region.</p>
            </div>
            <button onClick={onGoToScorecard} className="about-primary-btn">
              <span>ZUR SCORECARD</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
