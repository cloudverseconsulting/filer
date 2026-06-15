import "../style.css"

const LAST_UPDATED = "June 15, 2026"

export default function PrivacyPage() {
  return (
    <div className="bg-bg-primary text-text-primary min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-sm">
            F
          </div>
          <span className="text-lg font-semibold">Filer</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-text-secondary text-sm mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-text-secondary">
          <Section title="The short version">
            <p>
              Filer works entirely on your device. We do not collect, store,
              transmit, or sell any information about you or your files.
              Everything stays local.
            </p>
          </Section>

          <Section title="What permissions we use and why">
            <ul className="flex flex-col gap-3">
              <Permission
                name="downloads"
                why="To intercept each file download before it saves, so we can rename it and route it to the correct folder. We only see the filename and the URL it was downloaded from. We never read file contents."
              />
              <Permission
                name="tabs"
                why="To read the title of the current browser tab at the moment a download starts. This is the primary signal used to generate a meaningful filename (e.g. 'Q2 Revenue Report' from the page you were viewing). We do not track browsing history or any other tab activity."
              />
              <Permission
                name="storage"
                why="To save your rules and settings locally using Chrome's built-in storage. Settings and rules are stored in chrome.storage.sync (so they sync across your Chrome profile on paid plans). The activity log is stored in chrome.storage.local and never leaves your device."
              />
              <Permission
                name="host_permissions (<all_urls>)"
                why="Required by Chrome so the downloads API can fire for files from any website. Filer does not inject scripts into web pages or read page content."
              />
            </ul>
          </Section>

          <Section title="Data we do NOT collect">
            <ul className="flex flex-col gap-2">
              {[
                "File contents — we only see filenames and source URLs",
                "Browsing history or visited URLs beyond the active download",
                "Personal information, names, or email addresses",
                "Analytics, crash reports, or telemetry of any kind",
                "Payment information — billing is handled by our payment provider"
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-success mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Local storage">
            <p>
              Your rules, settings, and activity log are stored using Chrome's
              built-in storage APIs:
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <strong className="text-text-primary">
                  chrome.storage.sync
                </strong>{" "}
                — stores your rules and settings. On paid plans, Chrome syncs
                this across devices where you're signed into the same Chrome
                profile. On free plans, it behaves like local storage.
              </li>
              <li className="mt-2">
                <strong className="text-text-primary">
                  chrome.storage.local
                </strong>{" "}
                — stores your activity log (the list of renamed files). This
                never leaves your device. Free plans retain the last 30 days;
                paid plans retain up to 500 entries.
              </li>
            </ul>
          </Section>

          <Section title="Third-party services">
            <p>
              The free version of Filer uses no third-party services. If you
              upgrade to Pro, your payment is processed by our payment provider.
              We receive confirmation that payment was made but not your card
              details.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Filer is not directed at children under 13 and does not knowingly
              collect information from them.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we materially change this policy, we'll update the date at the
              top of this page. Since Filer collects no data, meaningful changes
              are unlikely.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email us at{" "}
              <a
                href="mailto:privacy@filer.app"
                className="text-accent hover:underline">
                privacy@filer.app
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-text-primary mb-3">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Permission({ name, why }: { name: string; why: string }) {
  return (
    <li className="flex flex-col gap-1 rounded-lg border border-border bg-bg-card p-3">
      <code className="text-xs font-mono text-accent">{name}</code>
      <p>{why}</p>
    </li>
  )
}
