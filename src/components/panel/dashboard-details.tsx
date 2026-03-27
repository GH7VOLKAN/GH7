"use client";

interface DashboardDetailsProps {
  brandName: string;
}

export default function DashboardDetails({ brandName }: DashboardDetailsProps) {
  return (
    <div className="detail-zone">
      {/* ── 3-column Metrics ──────────────────── */}
      <div className="detail-grid-3" style={{ marginBottom: 2 }}>
        <div className="dc">
          <span className="dc-label">Ses Pay{"\u0131"}</span>
          <div className="mini-metric">
            <span className="mm-num">%26</span>
            <span className="mm-delta pos">{"\u2191"} %2</span>
          </div>
          <span className="mm-label">T{"\u00fc"}m AI {"\u00f6"}nerilerinde pay{"\u0131"}n{"\u0131"}z</span>
        </div>
        <div className="dc">
          <span className="dc-label">Kapsam</span>
          <div className="mini-metric">
            <span className="mm-num">%80</span>
            <span className="mm-delta pos">{"\u2191"} %5</span>
          </div>
          <span className="mm-label">Takip edilen sorgularda g{"\u00f6"}r{"\u00fc"}nme oran{"\u0131"}</span>
        </div>
        <div className="dc">
          <span className="dc-label">Ortalama Pozisyon</span>
          <div className="mini-metric">
            <span className="mm-num">1.4</span>
            <span className="mm-delta pos">{"\u2191"} 0.3</span>
          </div>
          <span className="mm-label">AI&apos;{"\u0131"}n sizi {"\u00f6"}nerme s{"\u0131"}ras{"\u0131"} (d{"\u00fc"}{"\u015f"}{"\u00fc"}k = iyi)</span>
        </div>
      </div>

      {/* ── Sorgu + Platform Grid ─────────────── */}
      <div className="detail-grid" style={{ marginBottom: 2 }}>
        {/* Sorgu Bazl\u0131 G\u00f6r\u00fcn\u00fcrl\u00fck */}
        <div className="dc">
          <span className="dc-label">Sorgu Bazl{"\u0131"} G{"\u00f6"}r{"\u00fc"}n{"\u00fc"}rl{"\u00fc"}k</span>
          <div className="bar-list">
            <div className="bar-row">
              <span className="bar-lbl">Havuz ekipman{"\u0131"} fiyat</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: "36%" }} /></div>
              <span className="bar-val">%36</span>
            </div>
            <div className="bar-row">
              <span className="bar-lbl">Havuz pompas{"\u0131"} se{"\u00e7"}imi</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: "29%" }} /></div>
              <span className="bar-val">%29</span>
            </div>
            <div className="bar-row">
              <span className="bar-lbl">Is{"\u0131"}tma sistemi kar{"\u015f"}.</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: "24%" }} /></div>
              <span className="bar-val">%24</span>
            </div>
            <div className="bar-row">
              <span className="bar-lbl">Y{"\u00fc"}zme havuzu bak{"\u0131"}m</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: "18%" }} /></div>
              <span className="bar-val">%18</span>
            </div>
            <div className="bar-row">
              <span className="bar-lbl">Klor dozaj sistemi</span>
              <div className="bar-track"><div className="bar-fill weak" style={{ width: "11%" }} /></div>
              <span className="bar-val weak">%11 {"\u2193"}</span>
            </div>
          </div>
        </div>

        {/* Platform Da\u011f\u0131l\u0131m\u0131 */}
        <div className="dc">
          <span className="dc-label">Platform Da{"\u011f"}{"\u0131"}l{"\u0131"}m{"\u0131"}</span>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Skor</th>
                <th>De{"\u011f"}i{"\u015f"}im</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ChatGPT</td>
                <td>74</td>
                <td style={{ color: "var(--d-green)" }}>+8</td>
                <td><span className="score-pill sp-green">G{"\u00fc"}{"\u00e7"}l{"\u00fc"}</span></td>
              </tr>
              <tr>
                <td>Perplexity</td>
                <td>83</td>
                <td style={{ color: "var(--d-green)" }}>+12</td>
                <td><span className="score-pill sp-green">G{"\u00fc"}{"\u00e7"}l{"\u00fc"}</span></td>
              </tr>
              <tr>
                <td>Gemini</td>
                <td>58</td>
                <td style={{ color: "var(--d-green)" }}>+3</td>
                <td><span className="score-pill sp-amber">Orta</span></td>
              </tr>
              <tr>
                <td>AI Overview</td>
                <td>61</td>
                <td style={{ color: "var(--d-green)" }}>+5</td>
                <td><span className="score-pill sp-amber">Orta</span></td>
              </tr>
              <tr>
                <td>Claude</td>
                <td>49</td>
                <td style={{ color: "var(--d-red)" }}>-3</td>
                <td><span className="score-pill sp-red">Zay{"\u0131"}f</span></td>
              </tr>
              <tr>
                <td>Copilot</td>
                <td>41</td>
                <td style={{ color: "var(--d-red)" }}>-1</td>
                <td><span className="score-pill sp-red">Zay{"\u0131"}f</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Rakip + Aksiyonlar Grid ───────────── */}
      <div className="detail-grid" style={{ marginBottom: 0 }}>
        {/* Rakip Ses Pay\u0131 Da\u011f\u0131l\u0131m\u0131 */}
        <div className="dc">
          <span className="dc-label">Rakip Ses Pay{"\u0131"} Da{"\u011f"}{"\u0131"}l{"\u0131"}m{"\u0131"}</span>
          <div className="comp-list">
            <div className="comp-item">
              <span className="comp-name me">{brandName}</span>
              <div className="comp-bar-wrap"><div className="comp-bar" style={{ width: "26%" }} /></div>
              <span className="comp-pct">%26</span>
            </div>
            <div className="comp-item">
              <span className="comp-name">Havuz D{"\u00fc"}nyas{"\u0131"}</span>
              <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "19%" }} /></div>
              <span className="comp-pct">%19</span>
            </div>
            <div className="comp-item">
              <span className="comp-name">Piscimar TR</span>
              <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "14%" }} /></div>
              <span className="comp-pct">%14</span>
            </div>
            <div className="comp-item">
              <span className="comp-name">AquaTech</span>
              <div className="comp-bar-wrap"><div className="comp-bar dim" style={{ width: "9%" }} /></div>
              <span className="comp-pct">%9</span>
            </div>
            <div className="comp-item">
              <span className="comp-name" style={{ color: "var(--d-g400)" }}>Di{"\u011f"}er</span>
              <div className="comp-bar-wrap">
                <div className="comp-bar dim" style={{ width: "32%", background: "var(--d-g100)" }} />
              </div>
              <span className="comp-pct" style={{ color: "var(--d-g400)" }}>%32</span>
            </div>
          </div>
        </div>

        {/* Bu Haftan\u0131n Aksiyon Listesi */}
        <div className="dc">
          <span className="dc-label">Bu Haftan{"\u0131"}n Aksiyon Listesi</span>
          <div className="action-list">
            <div className="action-item">
              <span className="action-priority ap-high">Y{"\u00fc"}ksek</span>
              <div>
                <div className="action-text">Klor dozaj sayfas{"\u0131"}na FAQ ekle</div>
                <div className="action-sub">Perplexity&apos;de rakip bu sorguda sizi ge{"\u00e7"}iyor. Haz{"\u0131"}r i{"\u00e7"}erik panelde.</div>
              </div>
            </div>
            <div className="action-item">
              <span className="action-priority ap-high">Y{"\u00fc"}ksek</span>
              <div>
                <div className="action-text">Claude i{"\u00e7"}in schema markup g{"\u00fc"}ncelle</div>
                <div className="action-sub">Claude sizi tan{"\u0131"}m{"\u0131"}yor. Haz{"\u0131"}r kod kopyalanmaya haz{"\u0131"}r.</div>
              </div>
            </div>
            <div className="action-item">
              <span className="action-priority ap-mid">Orta</span>
              <div>
                <div className="action-text">Havuz {"\u0131"}s{"\u0131"}tma kar{"\u015f"}{"\u0131"}la{"\u015f"}t{"\u0131"}rma i{"\u00e7"}eri{"\u011f"}i</div>
                <div className="action-sub">Gemini&apos;de g{"\u00f6"}r{"\u00fc"}n{"\u00fc"}rl{"\u00fc"}k %24&apos;te. {"\u0130"}{"\u00e7"}erik tasla{"\u011f"}{"\u0131"} haz{"\u0131"}r.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
