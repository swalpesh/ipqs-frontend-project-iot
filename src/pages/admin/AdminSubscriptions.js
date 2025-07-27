import React, { useEffect, useState } from 'react';
import { Card, Badge, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { format, addYears } from 'date-fns';

export default function AdminSubscriptions() {
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const companyList = data?.companies || [];
        setCompanies(companyList);
        setFiltered(companyList);
      })
      .catch(err => console.error('Error fetching companies:', err));
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(companies);
    } else {
      setFiltered(
        companies.filter(c =>
          c.company_name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, companies]);

  const columns = [
    {
      name: 'Company Name',
      selector: row => row.company_name,
      sortable: true,
    },
    {
      name: 'Created At',
      selector: row => format(new Date(row.created_at), 'dd/MM/yyyy'),
      sortable: true,
    },
    {
      name: 'Subscription Ends',
      selector: row => format(new Date(row.subscription_end), 'dd/MM/yyyy'),
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => (
        <Badge
          bg={row.company_status === 'active' ? 'success' : 'danger'}
          className="text-capitalize"
        >
          {row.company_status}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="container-fluid py-4">
      <Card className="p-3 border-0 shadow-sm rounded-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <h5 className="fw-bold mb-2 mb-md-0">Subscription Overview</h5>
          <Form.Control
            type="text"
            placeholder="Search by Company Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-100 w-md-auto"
            style={{ maxWidth: 300 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <DataTable
            columns={columns}
            data={filtered}
            pagination
            highlightOnHover
            striped
            responsive
          />
        </div>
      </Card>
    </div>
  );
}
