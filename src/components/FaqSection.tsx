export function FaqSection() {
  return (
    <div className="space-y-6 text-sm text-slate-600">
      <section>
        <h3 className="text-sm font-semibold text-slate-900">
          FAQ (English)
        </h3>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="font-semibold text-slate-800">What is fixacv?</dt>
            <dd className="mt-1">
              fixacv is a free, privacy-first CV/resume builder. Everything runs in
              your browser and your data stays on your device.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">
              Do I need an account?
            </dt>
            <dd className="mt-1">
              No. There is no signup or cloud storage. Your CV is saved locally in
              your browser.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">
              Can I export to PDF?
            </dt>
            <dd className="mt-1">
              Yes. The preview matches the PDF, and the export is ready for printing
              and sending.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">
              Can I import from LinkedIn?
            </dt>
            <dd className="mt-1">
              Yes. You can import LinkedIn CSV exports to prefill your profile,
              experience, education, skills, and courses.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">
              Is it available in English and Swedish?
            </dt>
            <dd className="mt-1">
              Yes. The app supports English and Swedish content, with a focus on
              clean, Scandinavian-style CVs.
            </dd>
          </div>
        </dl>
      </section>

      <section lang="sv">
        <h3 className="text-sm font-semibold text-slate-900">
          Vanliga frågor (Svenska)
        </h3>
        <dl className="mt-3 space-y-4">
          <div>
            <dt className="font-semibold text-slate-800">Vad är fixacv?</dt>
            <dd className="mt-1">
              fixacv är en gratis, integritetsfokuserad CV‑byggare. Allt körs i
              webbläsaren och din data stannar på din enhet.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Behöver jag skapa konto?</dt>
            <dd className="mt-1">
              Nej. Ingen inloggning krävs och ingen molnlagring används.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Kan jag exportera till PDF?</dt>
            <dd className="mt-1">
              Ja. Förhandsvisningen matchar PDF‑exporten och fungerar för utskrift
              och delning.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Kan jag importera från LinkedIn?</dt>
            <dd className="mt-1">
              Ja. Du kan importera LinkedIn‑CSV för att fylla i profil, erfarenhet,
              utbildning, kompetenser och kurser.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-800">Finns stöd för svenska?</dt>
            <dd className="mt-1">
              Ja. Innehållet fungerar på svenska och engelska med fokus på en ren
              och professionell CV‑layout.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
