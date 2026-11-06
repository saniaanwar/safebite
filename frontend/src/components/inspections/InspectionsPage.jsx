import "./InspectionsPage.css";

// Entry point for the restaurant inspection workspace.
function InspectionsPage() {
  return (
    <section className="inspections-page" aria-labelledby="inspections-title">
      <p className="inspections-page__notice">
        <strong>Demonstration data:</strong> All restaurant and inspection
        records in this demo are synthetic.
      </p>

      <header className="inspections-page__heading">
        <p className="inspections-page__eyebrow">Boston restaurant workspace</p>

        <h1 id="inspections-title">Restaurant inspections</h1>

        <p className="inspections-page__intro">
          Explore inspection history and community reports for fictional
          restaurants.
        </p>
      </header>
    </section>
  );
}

// Required by the course, including components without props.
InspectionsPage.propTypes = {};

export default InspectionsPage;
