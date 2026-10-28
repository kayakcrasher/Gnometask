import { useGame } from "@/lib/game/store";
import { BANK_NAME, STARTER_LOANS, WEEKLY_INTEREST } from "@/lib/game/bank";
import { quoteDay } from "@/lib/game/island-economy";
export const marineButton =
  "min-h-11 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40";
export function BankLedger() {
  const s = useGame(),
    b = s.bank;
  return (
    <section className="space-y-3 text-ink">
      <div className="rounded-2xl bg-pine p-4 text-parchment">
        <p className="text-xs tracking-widest text-gold">
          DEEP ROOTS. LONG LEDGERS.
        </p>
        <h2 className="font-display text-xl font-bold">{BANK_NAME}</h2>
        <p className="mt-2 text-sm">
          Island-wide banking, from Tideham to the northern frontier. Quill Bram
          manages your branch.
        </p>
      </div>
      {!b.signed ? (
        <>
          <h3 className="font-display text-lg font-bold">
            A beginning, co-signed by Pappy
          </h3>
          <p className="text-sm">
            “A home, a little shop, a reason to stay. I’ll put my name beside
            yours, sprout. Just promise you’ll read the small print.”
          </p>
          <p className="rounded-xl bg-gold/20 p-3 text-sm">
            Choose one loan.{" "}
            <strong>0.6% interest every 7 in-game market days</strong>, charged
            on the outstanding balance and rounded up to a whole coin. Unpaid
            interest joins the balance. No real-world or offline interest. Repay
            any amount at any time, with no fees. This is a one-time starter
            loan.
          </p>
          <div className="space-y-2">
            {STARTER_LOANS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => s.chooseStarterLoan(n)}
                className={`${marineButton} flex w-full items-center justify-between bg-pine text-parchment`}
              >
                <span>Borrow {n.toLocaleString()} coins</span>
                <span className="text-xs">
                  First week: {n * WEEKLY_INTEREST} interest
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs">
            Co-signer: Ol Pappy · The full amount is added to your existing
            purse.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-bold">
            Pappy’s co-signed account · {b.owed ? "Open" : "Paid off"}
          </h3>
          <p className="text-2xl font-bold">
            {b.owed.toLocaleString()} coins owed
          </p>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt>Original loan</dt>
            <dd>{b.original.toLocaleString()}</dd>
            <dt>Interest charged</dt>
            <dd>{b.interest.toLocaleString()}</dd>
            <dt>Total repaid</dt>
            <dd>{b.repaid.toLocaleString()}</dd>
            <dt>Next interest</dt>
            <dd>
              {b.owed
                ? `Market day ${b.lastDay + 7} · ${Math.ceil(b.owed * 0.006).toLocaleString()} coins`
                : "None"}
            </dd>
          </dl>
          <p className="text-xs">
            Market day {quoteDay(s)} · 0.6% per 7 market days, compounded on the
            unpaid balance. No offline charges or repayment fees.
          </p>
          <div className="flex flex-wrap gap-2">
            {[100, 1000, 10000, b.owed]
              .filter((n, i, a) => n > 0 && a.indexOf(n) === i)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!s.coins || !b.owed || !!s.combat}
                  className={`${marineButton} bg-pine text-parchment`}
                  onClick={() => s.repayBank(n)}
                >
                  Pay {Math.min(n, b.owed, s.coins).toLocaleString()}
                  {n === b.owed ? " · clear balance" : ""}
                </button>
              ))}
          </div>
          <p className="text-xs">
            Payments are capped at the coins in your purse and the debt you owe.
          </p>
        </>
      )}
    </section>
  );
}
export function StarterLoanChoice() {
  const pending = useGame((s) => s.named && !s.atHome && s.bank.pending && (!s.opening.prologue||s.opening.prologue==='borrow'));
  const prologue=useGame(s=>s.opening.prologue);
  if (!pending) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-pine/95 p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your starter loan"
    >
      <div className="max-h-[96dvh] w-full max-w-lg overflow-auto rounded-3xl bg-parchment p-4 shadow-panel">
        <p className="text-xs font-bold uppercase tracking-widest text-bark">{BANK_NAME} · {prologue?"Port Victoria":"Thimblehaven"}</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-pine">A fresh start, backed by Pappy.</h2>
        <p className="mt-2 text-sm text-ink">“Your home in Thimblehaven is yours either way, sprout. If you want help with roads, shops and the first neighbours, I’ll co-sign. Choose only what feels right.”</p>
        <p className="my-3 text-sm font-semibold text-pine">0.6% interest every 7 in-game market days.</p>
        <div className="space-y-2">
          {STARTER_LOANS.map(n=><button key={n} type="button" onClick={()=>useGame.getState().chooseStarterLoan(n)} className={`${marineButton} flex w-full items-center justify-between bg-pine text-parchment`}><span>Borrow {n.toLocaleString()} coins</span><span className="text-xs">First week: {n*WEEKLY_INTEREST} interest</span></button>)}
        </div>
        <button type="button" onClick={()=>useGame.getState().declineStarterLoan()} className={`${marineButton} mt-3 w-full bg-gold text-pine`}>No loan for now — I’ll start small</button>
        <details className="mt-3 text-xs text-bark">
          <summary className="min-h-11 cursor-pointer py-3 font-bold">Loan details</summary>
          One starter loan per game. Interest is rounded up on the unpaid balance, and unpaid interest joins the balance. There are no real-world or offline charges. Repay any amount at the bank, with no fees.
        </details>
      </div>
    </div>
  );
}
