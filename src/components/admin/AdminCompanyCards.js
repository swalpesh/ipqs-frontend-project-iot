import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminCompanyCards({ showExploreAll = true }) {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const [companiesRes, deviceCountsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/companies`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/companies/devices`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (companiesRes.status === 401 || deviceCountsRes.status === 401) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }

        const companiesData = await companiesRes.json();
        const deviceCountsData = await deviceCountsRes.json();

        const deviceMap = {};
        deviceCountsData.companies.forEach((c) => {
          deviceMap[c.company_id] = c.device_count;
        });

        const mergedCompanies = (companiesData.companies || []).map((company) => ({
          ...company,
          device_count: deviceMap[company.company_id] || 0,
        }));

        setCompanies(mergedCompanies);
        setFilteredCompanies(mergedCompanies);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setCompanies([]);
        setFilteredCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchTerm(keyword);
    const filtered = companies.filter((company) =>
      company.company_name.toLowerCase().includes(keyword)
    );
    setFilteredCompanies(filtered);
  };

  const displayedCompanies = showExploreAll
    ? filteredCompanies
    : filteredCompanies.slice(0, 8);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Companies Overview</h4>
        {showExploreAll && (
          <Link to="/admin/companies">
            <Button className="rounded-pill px-4 fw-semibold shadow-sm" variant="primary">
              Explore All Companies
            </Button>
          </Link>
        )}
      </div>

      <InputGroup className="mb-4 shadow-sm">
        <InputGroup.Text className="bg-white border-end-0">
          <SearchIcon fontSize="small" />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search companies by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="border-start-0 shadow-none"
        />
      </InputGroup>

      <Row className="g-4">
        {displayedCompanies.length === 0 ? (
          <p className="text-muted">No companies found.</p>
        ) : (
          displayedCompanies.map((company) => (
            <Col xs={12} sm={6} lg={4} xl={3} key={company.company_id}>
              <Card className="h-100 border-0 rounded-4 shadow-sm company-card transition">
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="text-muted small fw-semibold mb-2">COMPANY</div>
                    <h5 className="fw-bold text-dark mb-2">{company.company_name}</h5>
                    <div className="text-secondary mb-3">
                      <strong>{company.device_count}</strong> devices installed
                    </div>
                  </div>
                  <Button
                    variant="outline-dark"
                    className="rounded-pill fw-semibold w-100"
                    onClick={() => navigate(`/admin/companies/${company.company_id}`)}
                  >
                    Explore Company
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      <style>{`
        .company-card:hover {
          transform: translateY(-4px);
          transition: all 0.2s ease-in-out;
        }
        .company-card:hover .btn {
          background-color: #45C8C2;
          border-color: #45C8C2;
          color: white;
        }
      `}</style>
    </div>
  );
}
