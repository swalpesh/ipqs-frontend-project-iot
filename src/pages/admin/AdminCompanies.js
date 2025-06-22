import React from 'react';
import AdminCompanyCards from '../../components/admin/AdminCompanyCards';

export default function CompaniesPage() {
  return (
    <div className="container-fluid">
      <div className="row">
        <AdminCompanyCards showExploreAll={false} />
      </div>
    </div>
  );
}